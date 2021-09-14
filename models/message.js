const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  oid: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Message', messageSchema);
