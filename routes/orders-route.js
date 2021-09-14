const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const ordersController = require("../controllers/orders-controller");
const authCheck = require("../middleware/auth-check");

router.use(authCheck);

router.get("/recent", ordersController.getRecentOrders);
router.get("/all", ordersController.getAllOrders);
router.get("/completed", ordersController.getCompletedOrders);
router.get("/:oid/refunder", ordersController.getRefunderByOrder);
router.get("/:oid", ordersController.getOrderById);
router.post(
  "/",
  [
    check("name").isLength({ min: 3 }).not().isEmpty(),
    check("amount").not().isEmpty(),
  ],
  ordersController.createOrder
);
router.patch("/:oid", ordersController.updateOrderById);
router.delete("/:oid", ordersController.deleteOrderById);

module.exports = router;
