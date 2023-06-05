const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createAds,
  getAdsies,
  excelData,
  multDeleteAds,
  getAds,
  updateAds,
} = require("../controller/Ads");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createAds)
  .get(getAdsies);
router.route("/excel").get(protect, authorize("admin"), excelData);
router.route("/delete").delete(protect, authorize("admin"), multDeleteAds);
router
  .route("/:id")
  .get(getAds)
  .put(protect, authorize("admin", "operator"), updateAds);

module.exports = router;
