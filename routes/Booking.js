const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const { createBooking, getBookings, multDeleteBooking, getBooking, getCountBooking, excelData } = require("../controller/Booking");

router
  .route("/")
  .post(createBooking)
  .get(protect, authorize("admin", "operator"), getBookings);

  router.route('/excel').get(protect, authorize('admin','operator'), excelData);

router
  .route("/delete")
  .delete(protect, authorize("admin", "operator"), multDeleteBooking);

router.route("/:id").get(protect, authorize("admin", "operator"), getBooking);

router.route('/count').get(protect, authorize("admin", "operator"), getCountBooking)

module.exports = router;
