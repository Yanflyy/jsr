const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const storeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  hot: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  geo: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  item_limit: {
    type: Number,
    required: true,
  },
  refund_limit: {
    type: Number,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
});

storeSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Store', storeSchema);
