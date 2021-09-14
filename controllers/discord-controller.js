const express = require("express");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const LogController = require("../controllers/log-controller");

const syncDiscordWithMongo = async (userId, discordId) => {
  const update = {
    discord: discordId,
  };
  let user;
  //Try to Update User in Mongo
  try {
    user = await User.findByIdAndUpdate(userId, update, {
      new: true,
    });
  } catch (err) {
    const error = new HttpError("Error Updating User", 500);
    console.log(error);
  }
  //Confirm Change
  LogController.logAction(
    user.username + " just updated their Discord to " + discordId
  );
};

exports.syncDiscordWithMongo = syncDiscordWithMongo;
