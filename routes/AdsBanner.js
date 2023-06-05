const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createAdsBanner,
  getAdsBanner,
  getFullData,
  multDeleteAdsBanner,
  updateAdsBanner,
  getAdsBanners,
} = require("../controller/AdsBanner");

router
  .route("/")
  .post(protect, authorize("admin"), createAdsBanner)
  .get(getAdsBanners);
router.route("/excel").get(protect, authorize("admin"), getFullData);
router
  .route("/delete")
  .delete(protect, authorize("admin"), multDeleteAdsBanner);
router
  .route("/:id")
  .get(getAdsBanner)
  .put(protect, authorize("admin"), updateAdsBanner);

module.exports = router;
