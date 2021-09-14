const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  oid: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  refunder: {
    type: String,
  },
});

module.exports = mongoose.model('Order', orderSchema);
