const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createCost,
  getCosts,
  updateCost,
  multDeleteCost,
  getFullData,
  getCost,
  getInitData,
  excelConvert,
  getFilterCost,
  getTableCosts,
} = require("../controller/Cost");

router.route("/").post(protect, authorize("admin"), createCost).get(getCosts);
router.route("/table").get(getTableCosts);
router.route("/filter").get(getFilterCost);
router.route("/init").get(getInitData);
router.route("/excel").post(protect, authorize("admin"), excelConvert);

router.route("/excel").get(protect, authorize("admin"), getFullData);
router.route("/delete").delete(protect, authorize("admin"), multDeleteCost);

router
  .route("/:id")
  .get(getCost)
  .put(protect, authorize("admin", "operator"), updateCost);

module.exports = router;
