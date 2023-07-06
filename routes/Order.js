const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createOrder,
  getCountOrder,
  getOrders,
  multDeleteOrder,
  updateOrder,
  getOrder,
  getUserOrders,
} = require("../controller/Order");

router.route("/").post(protect, createOrder).get(protect, getOrders);
router.route("/user").get(protect, getUserOrders);
router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountOrder);

router.route("/delete").delete(protect, authorize("admin"), multDeleteOrder);
router.route("/:id").get(getOrder).put(protect, updateOrder);

module.exports = router;
