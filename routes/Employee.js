const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createEmployee,
  getEmployees,
  excelData,
  multDeleteEmployee,
  getEmployee,
  getCountEmployee,
  updateEmployee,
} = require("../controller/Employee");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createEmployee)
  .get(getEmployees);

router.route("/excel").get(protect, authorize("admin", "operator"), excelData);

router
  .route("/delete")
  .delete(protect, authorize("admin", "operator"), multDeleteEmployee);

router
  .route("/:id")
  .get(protect, authorize("admin", "operator"), getEmployee)
  .put(protect, authorize("admin", "operator"), updateEmployee);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountEmployee);

module.exports = router;
