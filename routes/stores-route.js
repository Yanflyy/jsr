const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const storesController = require("../controllers/stores-controller");

const authCheck = require("../middleware/auth-check");

router.use(authCheck);

router.get("/", storesController.getStores);
router.get("/:id", storesController.getStoreById);
//router.post('/create', storesController.createStore);

module.exports = router;
