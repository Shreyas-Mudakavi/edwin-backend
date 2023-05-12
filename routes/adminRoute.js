const express = require("express");
const {
  getStatistics,
  getAll,
  postSingleImage,
  postMultipleImages,
  addStaticContent,
  getStaticContent,
  updateStaticContent,
  viewStaticContent,
} = require("../controllers/adminController");
const {
  createCategory,
  deleteCategory,
  updateCategory,
} = require("../controllers/categoryController");
const {
  getAllOrders,
  deleteOrder,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const {
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const {
  createPromotion,
  updatePromotion,
  deletePromotion,
} = require("../controllers/promotionController");
const { allReviews, deleteReview } = require("../controllers/reviewController");
const {
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/subCategoryController");
const {
  adminLogin,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { auth, isAdmin } = require("../middlewares/auth");
const { s3Uploadv2, upload, s3UploadMulti } = require("../utils/s3");
const router = express.Router();

router.get("/all", getAll);
router.get("/statistics/:time", auth, isAdmin, getStatistics);
router.post("/login", adminLogin);
router.get("/user/all", auth, isAdmin, getAllUsers);
router
  .route("/user/:id")
  .put(auth, isAdmin, updateUser)
  .get(auth, isAdmin, getUser)
  .delete(auth, isAdmin, deleteUser);

router.get("/orders/all", auth, isAdmin, getAllOrders);
router.put("/order/:id/update/status", auth, isAdmin, updateOrderStatus);
router
  .route("/order/:id")
  .get(auth, isAdmin, getOrderById)
  .delete(auth, isAdmin, deleteOrder);

router.post("/category/create", auth, isAdmin, createCategory);
router
  .route("/category/:id")
  .put(auth, isAdmin, updateCategory)
  .delete(auth, isAdmin, deleteCategory);

router.post("/product/create", auth, isAdmin, createProduct);
router
  .route("/product/:id")
  .put(auth, isAdmin, updateProduct)
  .delete(auth, isAdmin, deleteProduct);

router.get("/review/all", auth, isAdmin, allReviews);
router.delete("/review/:id", auth, isAdmin, deleteReview);

router.post("/promotion/create", auth, isAdmin, createPromotion);
router
  .route("/promotion/:id")
  .put(auth, isAdmin, updatePromotion)
  .delete(auth, isAdmin, deletePromotion);

router.post("/image", upload.single("image"), postSingleImage);
router.post("/multi-image", upload.array("image"), postMultipleImages);

router.post("/add/static", auth, isAdmin, addStaticContent);
router.get("/get/staticCont", auth, isAdmin, getStaticContent);
router.get("/get/static/:id", auth, isAdmin, viewStaticContent);
router.put("/update/static/:id", auth, isAdmin, updateStaticContent);

module.exports = router;
