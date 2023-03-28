const router = require("express").Router();

const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getAllCategories,
} = require("../controller/brandCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleWare");

router.post("/", createBrand);
router.put("/:id", authMiddleWare, isAdmin, updateBrand);
router.delete("/:id", authMiddleWare, isAdmin, deleteBrand);
router.get("/:id", getBrand);
router.get("/", getAllCategories);

module.exports = router;
