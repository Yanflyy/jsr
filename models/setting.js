const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const settingSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  discord: {
    type: String,
    required: true,
  },
  telegram: {
    type: String,
    required: true,
  },
  online: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Setting", settingSchema);
