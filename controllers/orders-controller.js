const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Order = require("../models/order");
const User = require("../models/user");
const LogController = require("../controllers/log-controller");
const order = require("../models/order");

const genOrderId = (size) => {
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let ID = "";
  for (let i = 0; i < size; i++) {
    ID += charset[Math.floor(Math.random() * charset.length)];
  }
  return ID;
};

const getOrderById = async (req, res, next) => {
  const orderId = req.params.oid;
  let order;
  try {
    order = await Order.findOne({ oid: orderId });
  } catch (err) {
    const error = new HttpError("Something went wrong.", 500);
    return next(error);
  }
  if (!order) {
    const error = new HttpError("Could not find that Order..", 404);
    return next(error);
  }
  res.json({ order: order.toObject({ getters: true }) });
};

const getRecentOrders = async (req, res, next) => {
  let orders;
  try {
    orders = await Order.find({}).limit(8).sort({ status: 1, date: -1 });
  } catch (err) {
    const error = new HttpError("Something went wrong.", 500);
    return next(error);
  }
  if (!orders) {
    const error = new HttpError("No Orders", 404);
    return next(error);
  }

  if (req.userData.rank != "Admin") {
    const error = new HttpError("Not Admin", 401);
    return next(error);
  }

  res.json({
    orders: orders.map((order) => order.toObject({ getters: true })),
  });
};

const getAllOrders = async (req, res, next) => {
  let orders;
  let criteria = {};
  try {
    orders = await Order.find({ status: { $nin: ["4", "5"] } }).sort({
      date: -1,
    });
  } catch (err) {
    const error = new HttpError("Something went wrong.", 500);
    return next(error);
  }
  if (!orders) {
    const error = new HttpError("No Orders", 404);
    return next(error);
  }

  if (req.userData.rank != "Admin") {
    const error = new HttpError("Not Admin", 401);
    return next(error);
  }

  res.json({
    orders: orders.map((order) => order.toObject({ getters: true })),
  });
};

const getCompletedOrders = async (req, res, next) => {
  let orders;
  try {
    orders = await Order.find({
      status: { $in: ["4", "5"] },
    }).sort({
      status: 1,
      date: 1,
    });
  } catch (err) {
    const error = new HttpError("Something went wrong.", 500);
    return next(error);
  }
  if (!orders) {
    const error = new HttpError("No Orders", 404);
    return next(error);
  }

  if (req.userData.rank != "Admin") {
    const error = new HttpError("Not Admin", 401);
    return next(error);
  }

  res.json({
    orders: orders.map((order) => order.toObject({ getters: true })),
  });
};

const updateOrderById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid Inputs - Check your Data.", 422));
  }

  const update = req.body;
  const orderId = req.params.oid;

  let order;

  if (req.userData.rank != "Admin") {
    const error = new HttpError("Not Admin", 401);
    return next(error);
  }

  try {
    order = await Order.findOneAndUpdate({ oid: orderId }, update, {
      new: true,
    });
  } catch (err) {
    const error = new HttpError("Error Updating Order", 500);
    return next(error);
  }

  LogController.logAction(
    "Ticket " + order.oid + " was updated. Info Updated: " + update
  );
  res.status(200).json({ order: order.toObject({ getters: true }) });
};

const deleteOrderById = async (req, res, next) => {
  const orderId = req.params.oid;
  let order;
  try {
    order = Order.findOne({ oid: orderId });
  } catch (err) {
    const error = new HttpError("Error Finding Order to Delete", 500);
    return next(error);
  }

  if (!order) {
    const error = new HttpError("Could not find that order.", 404);
    return next(error);
  }

  try {
    await order.remove();
  } catch (err) {
    const error = new HttpError("Error Deleting Order", 500);
    return next(error);
  }

  LogController.logAction("Ticket " + orderId + " was deleted.");

  res.status(200).json({ message: "Deleted Order." });
};

const createOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid Inputs - Check your Data.", 422);
  }
  const { date, name, amount, status } = req.body;
  const createdOrder = new Order({
    oid: genOrderId(7),
    date,
    name,
    amount,
    status,
  });

  try {
    await createdOrder.save();
  } catch (err) {
    const error = new HttpError("Creating Order Failed - Try again :(", 500);
    return next(error);
  }

  LogController.logAction("Ticket " + order.oid + " was created.");

  res.status(201).json({ order: createdOrder });
};

const getRefunder = async (oid) => {
  let order;
  try {
    order = await Order.findOne({ oid: oid });
  } catch (err) {
    const error = new HttpError("Something went wrong.", 500);
    return next(error);
  }
  if (!order) {
    const error = new HttpError("Could not find that Order..", 404);
    return next(error);
  }
  return order;
};

const getRefunderByOrder = async (oid) => {
  const refunder = getRefunder(oid);
  let order_data;
  try {
    order_data = await User.findOne({ username: refunder.refunder });
  } catch (err) {
    const error = new HttpError("Someting Wong.", 500);
    return next(error);
  }
  return order_data;
};

const ordersCount = async (username, status) => {
  let result;
  let matches = await Order.find({
    refunder: username,
    status: { $in: status },
  });
  result = matches.length;
  return result;
};

exports.getOrderById = getOrderById;
exports.updateOrderById = updateOrderById;
exports.deleteOrderById = deleteOrderById;
exports.createOrder = createOrder;
exports.getRecentOrders = getRecentOrders;
exports.getCompletedOrders = getCompletedOrders;
exports.getAllOrders = getAllOrders;
exports.getRefunder = getRefunder;
exports.getRefunderByOrder = getRefunderByOrder;
exports.ordersCount = ordersCount;
