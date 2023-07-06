const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getProducts,
  createProduct,
  excelData,
  multDeleteProduct,
  getProduct,
  getCountProduct,
  updateProduct,
  getRandomProducts,
} = require("../controller/Product");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createProduct)
  .get(getProducts);

router.route("/random").get(getRandomProducts);
router.route("/excel").get(protect, authorize("admin", "operator"), excelData);

router
  .route("/delete")
  .delete(protect, authorize("admin", "operator"), multDeleteProduct);

router
  .route("/:id")
  .get(getProduct)
  .put(protect, authorize("admin", "operator"), updateProduct);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountProduct);

module.exports = router;
