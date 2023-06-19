const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createBooking,
  getBookings,
  multDeleteBooking,
  getBooking,
  getCountBooking,
  excelData,
  updateBooking,
  checkBooking,
} = require("../controller/Booking");

router
  .route("/")
  .post(createBooking)
  .get(protect, authorize("admin", "operator"), getBookings);

router.post("/checkbooking", checkBooking);

router.route("/excel").get(protect, authorize("admin", "operator"), excelData);

router
  .route("/delete")
  .delete(protect, authorize("admin", "operator"), multDeleteBooking);

router
  .route("/:id")
  .get(protect, authorize("admin", "operator"), getBooking)
  .put(protect, authorize("admin", "operator"), updateBooking);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountBooking);

module.exports = router;
