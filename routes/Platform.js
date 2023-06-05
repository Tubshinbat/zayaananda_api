const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createPlatform,
  getPlatform,
  getPlatforms,
  excelData,
  getCountPlatform,
  multDeletePlatform,
  updatePlatform,
} = require("../controller/Platform");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createPlatform)
  .get(getPlatforms);

router.route("/excel").get(excelData);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountPlatform);
router.route("/delete").delete(protect, authorize("admin"), multDeletePlatform);
router
  .route("/:id")
  .get(getPlatform)
  .put(protect, authorize("admin", "operator"), updatePlatform);

module.exports = router;
