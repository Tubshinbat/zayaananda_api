const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getInvoices,
  multDeleteInvoice,
  updateInvoice,
} = require("../controller/Invoice");

router.route("/").get(protect, getInvoices);

router.route("/delete").delete(protect, authorize("admin"), multDeleteInvoice);
router.route("/:id").get(protect, getOrder).put(protect, updateInvoice);

module.exports = router;
