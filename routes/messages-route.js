const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const messagesController = require('../controllers/messages-controller');
const authCheck = require('../middleware/auth-check');

module.exports = router;
