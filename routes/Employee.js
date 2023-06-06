const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const { createEmployee, getEmployees, excelData, multDeleteEmployee, getEmployee, getCountEmployee } = require("../controller/Employee");

router
  .route("/")
  .post(protect,authorize('admin','operator'), createEmployee)
  .get(protect, authorize("admin", "operator"), getEmployees);

  router.route('/excel').get(protect, authorize('admin','operator'), excelData);

router
  .route("/delete")
  .delete(protect, authorize("admin", "operator"), multDeleteEmployee);

router.route("/:id").get(protect, authorize("admin", "operator"), getEmployee);

router.route('/count').get(protect, authorize("admin", "operator"), getCountEmployee)

module.exports = router;
