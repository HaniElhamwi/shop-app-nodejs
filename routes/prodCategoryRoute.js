const router = require("express").Router();

const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
} = require("../controller/prodCategoryCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleWare");

router.post("/", createCategory);
router.put("/:id", authMiddleWare, isAdmin, updateCategory);
router.delete("/:id", authMiddleWare, isAdmin, deleteCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategory);

module.exports = router;
