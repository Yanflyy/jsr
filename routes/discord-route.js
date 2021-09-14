const express = require("express");
const fetch = require("node-fetch");
const crypto = require("crypto");
const DiscordOauth2 = require("discord-oauth2");
const HttpError = require("../models/http-error");
const authCheck = require("../middleware/auth-check");

const DiscordController = require("../controllers/discord-controller");

const router = express.Router();
const panelURL = `${process.env.WEB_URL}`;

let userId;

//Set OAuth Parameters
const oauth = new DiscordOauth2({
  clientId: "798741552947396648",
  clientSecret: "RaRDoiTSFHyxSxkBEPWt1xuEngi-Kd3Z",
  redirectUri: `${process.env.DISCORD_CALLBACK_URL}/api/discord/callback`,
});

//Create the URL
const url = oauth.generateAuthUrl({
  scope: ["identify", "guilds"],
  state: crypto.randomBytes(16).toString("hex"), // Be aware that randomBytes is sync if no callback is provided
});

//router.use(authCheck);

router.get("/link/:id", (req, res) => {
  userId = req.params.id;
  res.redirect(url);
});

router.get("/callback", async (req, res) => {
  const token = await oauth.tokenRequest({
    code: req.query.code,
    scope: "identify guilds",
    grantType: "authorization_code",
  });
  const userData = await oauth.getUser(token.access_token);
  const discordID = userData.username + "#" + userData.discriminator;
  console.log("UserID: " + userId);
  console.log("Discord: " + discordID);
  DiscordController.syncDiscordWithMongo(userId, discordID);
  res.redirect(panelURL);
});

module.exports = router;
