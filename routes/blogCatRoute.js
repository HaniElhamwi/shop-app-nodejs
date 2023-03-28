const router = require("express").Router();

const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
} = require("../controller/blogCatCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleWare");

router.post("/", createCategory);
router.put("/:id", authMiddleWare, isAdmin, updateCategory);
router.delete("/:id", authMiddleWare, isAdmin, deleteCategory);
router.get("/:id", getCategory);
router.get("/", getAllCategories);

module.exports = router;
