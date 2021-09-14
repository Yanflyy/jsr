const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const usersController = require("../controllers/users-controller");
const authCheck = require("../middleware/auth-check");

router.post("/login", usersController.login);

router.use(authCheck);

router.get("/", usersController.getUsers);
router.get("/profile/:id", usersController.getUserById);
router.get("/settings", usersController.getSettings);
router.patch("/settings", usersController.updateSettings);
router.post(
  "/signup",
  [
    check("username").isLength({ min: 3 }).not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.patch("/update/:uid", usersController.updateUserById);
router.delete("/update/:uid", usersController.deleteUserById);

module.exports = router;
