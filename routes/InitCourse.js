const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createInitCourse,
  getInitCourse,
  excelData,
  multDeleteInitCourse,
  updateInitCourse,
  getInitCourses,
} = require("../controller/InitCourse");

router
  .route("/")
  .post(protect, authorize("admin"), createInitCourse)
  .get(getInitCourses);

router.route("/excel").get(protect, authorize("admin"), excelData);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multDeleteInitCourse);

router
  .route("/:id")
  .get(getInitCourse)
  .put(protect, authorize("admin", "operator"), updateInitCourse);

module.exports = router;
