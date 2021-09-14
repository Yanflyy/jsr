const HttpError = require('../models/http-error');
const Store = require('../models/store');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { create } = require('../models/user');

const getStores = async (req, res, next) => {
  let users;
  try {
    stores = await Store.find({});
  } catch (err) {
    const error = new HttpError('Error Grabbing Stores', 500);
    return next(error);
  }
  //console.log(users);

  res.json({
    stores: stores.map((store) => store.toObject({ getters: true })),
  });
};

const getStoreById = async (req, res, next) => {
  let storeData;
  let storeId = req.params.id;
  try {
    storeData = await Store.findOne({ _id: storeId });
  } catch (err) {
    const error = new HttpError("Couldn't Pull Store Data", 401);
    next(error);
  }
  if (!storeData) {
    const error = new HttpError('Could not find that Store..', 404);
    return next(error);
  }
  res.json({ storeData: storeData.toObject({ getters: true }) });
};

const createStore = async (req, res, next) => {};

exports.getStores = getStores;
exports.create = createStore;
exports.getStoreById = getStoreById;
