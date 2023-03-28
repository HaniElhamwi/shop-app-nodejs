const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbId");
const { cloudinaryUploadImage } = require("../utils/cloudinary");
const fs = require("fs");

// create new blog
const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);

    res.json({
      status: "success",
      data: newBlog,
    });
    res.json(blog);
  } catch (err) {
    throw new Error(err);
  }
});

// update blog
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { req, body },
      { new: true }
    );
    res.json(updatedBlog);
  } catch (err) {
    throw new Error(err);
  }
});

// get blog
const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findById(id).populate("likes").populate("dislikes");
    await Blog.findByIdAndUpdate(id, { $inc: { numViews: 1 } }, { new: true });
    res.json(blog);
  } catch (err) {
    throw new Error(err);
  }
});

// get all blogs

const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    throw new Error(err);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await Blog.findByIdAndDelete(id);
    res.json("blog has deleted");
  } catch (err) {
    throw new Error(err);
  }
});

// like a post

const likeBlog = asyncHandler(async (req, res) => {
  try {
    const { blogId } = req.body;
    validateMongodbId(blogId);
    // find the blog
    const blog = await Blog.findById(blogId);
    // find login user
    const loginUserId = req.user._id;
    // find user has liked the blog
    const isLiked = blog.likes.find((userId) => {
      return userId?.toString() === loginUserId?.toString();
    });

    const alreadyDisliked = blog.dislikes.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyDisliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
        },
        { new: true }
      );
      res.json(blog);
    }
    if (isLiked) {
      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
      res.json(updatedBlog);
    } else {
      const updateBlog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { likes: loginUserId },
          isLiked: true,
        },
        { new: true }
      );
      res.json(updateBlog);
    }
  } catch (err) {
    throw new Error(err);
  }
});

const dislikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  const blog = await Blog.findById(blogId);
  const loginUserId = req.user._id;
  const alreadyIsLiked = blog.likes.find(
    (userId) => userId.toString() === loginUserId.toString()
  );
  const alreadyDisliked = blog.dislikes.find(
    (userId) => userId.toString() === loginUserId.toString()
  );
  if (alreadyIsLiked) {
    const findBlog = await Blog.findByIdAndUpdate(blogId, {
      $pull: { likes: loginUserId },
      isLiked: false,
    });
  }
  if (!alreadyDisliked) {
    const dislikedBlog = await Blog.findByIdAndUpdate(blogId, {
      $push: { dislikes: loginUserId },
      isDisliked: true,
    });
    res.json(dislikedBlog);
  } else {
    const removeDislike = await Blog.findByIdAndUpdate(blogId, {
      $pull: { dislikes: loginUserId },
      isDisliked: false,
    });
    res.json(removeDislike);
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const uploader = (path) => cloudinaryUploadImage(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      fs.unlinkSync(path);
    }
    console.log(id);
    console.log(urls);
    const findBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file.url;
        }),
      },
      { new: true }
    );
    console.log(findBlog);
    res.json(findBlog);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadImages,
};
