const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const { getProducts, createProduct, excelData, multDeleteProduct, getProduct, getCountProduct, updateProduct } = require("../controller/Product");

router
  .route("/")
  .post(protect,authorize('admin','operator'), createProduct)
  .get(protect, authorize("admin", "operator"), getProducts);

  router.route('/excel').get(protect, authorize('admin','operator'), excelData);

router
  .route("/delete")
  .delete(protect, authorize("admin", "operator"), multDeleteProduct);



router.route("/:id").get(protect, authorize("admin", "operator"), getProduct).put(protect, authorize("admin", "operator"), updateProduct);

router.route('/count').get(protect, authorize("admin", "operator"), getCountProduct)

module.exports = router;
