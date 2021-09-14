const HttpError = require("../models/http-error");
const User = require("../models/user");
const Order = require("../models/order");
const Setting = require("../models/setting");

const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { create, update } = require("../models/user");
const OrdersController = require("../controllers/orders-controller");
const LogController = require("../controllers/log-controller");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError("Error Grabbing Users", 500);
    return next(error);
  }

  const activeStatus = [1, 2, 3, 6, 7];
  const completedStatus = [4, 5];

  for (const user of users) {
    user.active = await OrdersController.ordersCount(
      user.username,
      activeStatus
    );
    user.completed = await OrdersController.ordersCount(
      user.username,
      completedStatus
    );
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const getUserById = async (req, res, next) => {
  let userData;
  let userId = req.params.id;
  try {
    userData = await User.findOne({ _id: userId }).select({
      username: 1,
      email: 1,
      rank: 1,
      avatar: 1,
      discord: 1,
      telegram: 1,
    });
  } catch (err) {
    const error = new HttpError("Couldn't Pull Profile Data", 401);
    next(error);
  }
  if (!userData) {
    const error = new HttpError("Could not find that User..", 404);
    return next(error);
  }
  res.json({ userData: userData.toObject({ getters: true }) });
};

const updateUserById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid Inputs - Check your Data.", 422));
  }

  let update = {};

  if (req.body.password) {
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(req.body.password, 12);
    } catch (err) {
      const error = new HttpError("Error Updating Password - Error #187.", 500);
      return next(error);
    }
    update.password = hashedPassword;
  }

  if (req.body.rank) {
    update.rank = req.body.rank;
  }

  const userId = req.params.uid;

  let user;

  if (req.userData.rank != "Admin") {
    const error = new HttpError("Not Admin", 401);
    return next(error);
  }

  try {
    user = await User.findByIdAndUpdate(userId, update, {
      new: true,
    });
  } catch (err) {
    const error = new HttpError("Error Updating User", 500);
    return next(error);
  }

  LogController.logAction(
    req.body.requester +
      " just updated the password / rank for : " +
      user.username
  );

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid Inputs - Check your Data.", 422));
  }
  const { username, email, password, rank } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({
      $or: [
        {
          email: email,
        },
        {
          username: username,
        },
      ],
    });
  } catch (err) {
    const error = new HttpError("Signup Error", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User Already Exists", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Couldn't Create User - Try again.", 500);
    return next(error);
  }

  const createdUser = new User({
    username,
    name_lower: username.toLowerCase(),
    password: hashedPassword,
    email,
    rank,
    orders: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Creating User Failed - Try again :(", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        email: createdUser.email,
        rank: createdUser.rank,
        discord: createdUser.discord,
      },
      process.env.JWT_KEY,
      { expiresIn: "2h" }
    );
  } catch (err) {
    const error = HttpError("Error with Signup. Please contact admin.", 500);
  }

  LogController.logAction("User " + username + " was created!");

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    rank: createdUser.rank,
    token: token,
  });
};

const login = async (req, res, next) => {
  const { username, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ name_lower: username });
  } catch (err) {
    const error = new HttpError("Login Error", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Invalid Credentials", 401);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Couldn't Log In - Check Credentials", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid Credentials", 401);
    return next(error);
  }

  let token;
  try {
    console.log(
      existingUser.id + " : " + existingUser.email + " : " + existingUser.rank
    );
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        rank: existingUser.rank,
      },
      process.env.JWT_KEY,
      { expiresIn: "2h" }
    );
  } catch (err) {
    const error = HttpError("Error with Login. Please contact admin.", 500);
  }

  LogController.logAction("User " + username + " logged in.");

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    rank: existingUser.rank,
    token: token,
  });
};

const deleteUserById = async (req, res, next) => {
  const userId = req.params.uid;
  let user;

  if (req.userData.rank != "Admin") {
    const error = new HttpError("Not Admin", 401);
    return next(error);
  }

  try {
    user = await User.findByIdAndRemove(userId, {
      new: true,
    });
  } catch (err) {
    const error = new HttpError("Error Deleting User", 500);
    return next(error);
  }

  LogController.logAction(
    req.body.requester + " just deleted user : " + user.username
  );

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const getSettings = async (req, res, next) => {
  let settings;
  try {
    settings = await Setting.find({});
  } catch (err) {
    const error = new HttpError("Error Grabbing Settings", 500);
    return next(error);
  }
  //console.log(users);

  res.json({
    settings: settings.map((setting) => setting.toObject({ getters: true })),
  });
};

const updateSettings = async (req, res, next) => {
  const update = req.body;
  let settings;
  console.log(update);
  if (req.userData.rank != "Admin") {
    const error = new HttpError("Not Admin", 401);
    return next(error);
  }
  try {
    settings = await Setting.findOneAndUpdate({ name: "profile1" }, update, {
      new: true,
    });
  } catch (err) {
    const error = new HttpError("Error Updating Settings", 500);
    return next(error);
  }

  LogController.logAction("Settings were just updated.");

  res.status(200).json({ settings: settings.toObject({ getters: true }) });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.getUserById = getUserById;
exports.updateUserById = updateUserById;
exports.deleteUserById = deleteUserById;
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
