const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createService,
  getServices,
  getCountService,
  multDeleteService,
  updateService,
  getService,
  excelData,
} = require("../controller/Services");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createService)
  .get(getServices);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountService);
router.route("/excel").get(excelData);
router.route("/delete").delete(protect, authorize("admin"), multDeleteService);
router
  .route("/:id")
  .get(getService)
  .put(protect, authorize("admin", "operator"), updateService);

module.exports = router;
