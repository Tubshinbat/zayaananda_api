const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createCostType,
  getCostTypes,
  changePosition,
  getCostType,
  deleteCostType,
  updateCostType,
} = require("../controller/CostType");

router
  .route("/")
  .post(protect, authorize("admin"), createCostType)
  .get(getCostTypes);

router.route("/change").post(protect, authorize("admin"), changePosition);

// "/api/v1/News-categories/id"
router
  .route("/:id")
  .get(getCostType)
  .delete(protect, authorize("admin"), deleteCostType)
  .put(protect, authorize("admin"), updateCostType);

module.exports = router;
