const express = require("express");
const router = express.Router();

//
const {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishHandler,
  ratings,
  uploadImages,
} = require("../controller/productCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleWare");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages");

router.put(
  "/upload/:id",
  authMiddleWare,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);
router.put("/wishlist", authMiddleWare, addToWishHandler);
router.put("/rating", authMiddleWare, ratings);
router.get("/get-all", authMiddleWare, isAdmin, getAllProducts);

router.post("/", authMiddleWare, isAdmin, createProduct);
router.get("/:id", getProduct);
router.put("/:id", authMiddleWare, isAdmin, updateProduct);
router.delete("/:id", authMiddleWare, isAdmin, deleteProduct);

module.exports = router;
