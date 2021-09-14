const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name_lower: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  discord: {
    type: String,
    default: "Not Set",
  },
  telegram: {
    type: String,
    default: "Not Set",
  },
  active: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Number,
    default: 0,
  },
  rank: {
    type: String,
    required: true,
  },
  orders: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Order",
    },
  ],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
