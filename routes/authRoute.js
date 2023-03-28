const router = require("express").Router();

const {
  createUser,
  loginUserCtrl,
  getAllUsers,
  deleteUser,
  getSingleUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishList,
  saveAddress,
  userCart,
  getUserCart,
  applyCoupon,
  emptyCart,
  createOrder,
  getOrders,
  updateOrderStatus,
} = require("../controller/userCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleWare");

router.get("/refresh", handleRefreshToken);
router.post("/forgot-password-token", forgotPasswordToken);
router.post("/reset-password/:token", resetPassword);
router.get("/wishlist", authMiddleWare, getWishList);
router.put("/password", authMiddleWare, updatePassword);
router.post("/register", createUser);
router.post("/cart/apply-coupon", authMiddleWare, applyCoupon);
router.post("/login", loginUserCtrl);
router.post("/admin-login", loginAdmin);
router.post("/cart", authMiddleWare, userCart);
router.get("/cart", authMiddleWare, getUserCart);
router.get("/get-orders", authMiddleWare, getOrders);
router.put("/update-order/:id", authMiddleWare, isAdmin, updateOrderStatus);
router.post("/cart/create-order", authMiddleWare, createOrder);
router.get("/logout", logout);
router.get("/all-users", getAllUsers);
router.get("/:id", authMiddleWare, isAdmin, getSingleUser);
router.delete("/empty-cart", authMiddleWare, emptyCart);
router.delete("/:id", deleteUser);
router.put("/edit-user", authMiddleWare, updatedUser);
router.put("/save-address", authMiddleWare, saveAddress);
router.post("/block-user/:id", authMiddleWare, isAdmin, blockUser);
router.post("/unblock-user/:id", authMiddleWare, unblockUser);

module.exports = router;
