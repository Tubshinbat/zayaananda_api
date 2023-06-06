const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createCourse,
  getCourses,
  excelData,
  multDeleteCourse,
  getCourse,
  updateCourse,
} = require("../controller/Course");

router
  .route("/")
  .post(protect, authorize("admin"), createCourse)
  .get(getCourses);

router.route("/excel").get(protect, authorize("admin"), excelData);
router.route("/delete").delete(protect, authorize("admin"), multDeleteCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorize("admin", "operator"), updateCourse);

module.exports = router;
