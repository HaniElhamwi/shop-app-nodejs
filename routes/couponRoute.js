const {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
} = require("../controller/couponCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleWare");

const router = require("express").Router();

router.post("/", authMiddleWare, isAdmin, createCoupon);
router.get("/", authMiddleWare, getAllCoupons);
router.put("/:id", authMiddleWare, isAdmin, updateCoupon);
router.delete("/:id", authMiddleWare, isAdmin, deleteCoupon);

module.exports = router;
