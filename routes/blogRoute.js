const router = require("express").Router();

const {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadImages,
} = require("../controller/blogCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleWare");
const { blogImgResize, uploadPhoto } = require("../middlewares/uploadImages");

router.put("/likes", authMiddleWare, likeBlog);
router.put("/dislikes", authMiddleWare, dislikeBlog);

router.put(
  "/upload/:id",
  authMiddleWare,
  isAdmin,
  uploadPhoto.array("images", 10),
  blogImgResize,
  uploadImages
);
router.post("/", authMiddleWare, isAdmin, createBlog);
router.put("/:id", authMiddleWare, isAdmin, updateBlog);
router.get("/:id", getBlog);
router.get("/", getAllBlogs);
router.delete("/:id", authMiddleWare, isAdmin, deleteBlog);

module.exports = router;
