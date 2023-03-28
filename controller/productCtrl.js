const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoId = require("../utils/validateMongodbId");
const { cloudinaryUploadImage } = require("../utils/cloudinary");
const fs = require("fs");

// CREATE PRODUCT
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const createProduct = await Product.create(req.body);
    res.json(createProduct);
  } catch (err) {
    throw new Error(err);
  }
});
// get product
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    console.log(Product);
    res.json(product);
  } catch (err) {
    throw new Error(err);
  }
});

// get all products
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    // filtering
    const queryObject = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObject[el]);
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Product.find(JSON.parse(queryStr));
    // sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }
    // limiting fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    const productCount = await Product.countDocuments();
    if (skip >= productCount) throw new Error("this page does not exist");
    const product = await query;
    res.json(product);
  } catch (err) {
    throw new Error(err);
  }
});

// UPDATE PRODUCT
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(product);
  } catch (err) {
    throw new Error(err);
  }
});

// DELETE PRODUCT
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);
    res.json("this product was deleted");
  } catch (err) {
    throw new Error(err);
  }
});

const addToWishHandler = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;

  try {
    const user = await User.findById(_id);
    const alreadyAdded = user.wishlist.find(
      (item) => item._id.toString() === prodId.toString()
    );
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: prodId },
        },
        { new: true }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: prodId },
        },
        { new: true }
      );
      console.log(user);
      res.json(user);
    }
  } catch (err) {
    throw new Error(err);
  }
});

const ratings = asyncHandler(async (req, res) => {
  try {
    const { star, prodId, comment } = req.body;
    const { _id } = req.user;

    const product = await Product.findById(prodId);
    const alreadyRated = product.ratings.find(
      (pro) => pro.postedBy.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
        { new: true }
      );
    } else {
      let product = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: { star, postedBy: _id, comment: comment },
          },
        },
        { new: true }
      );
    }
    const getAllRating = await Product.findById(prodId);
    const totalRating = getAllRating.ratings.length;
    const countRating = getAllRating.ratings.reduce(
      (prev, next) => prev + next.star,
      0
    );
    let actualRating = Math.round(countRating / totalRating);
    const updatedRatings = await Product.findByIdAndUpdate(
      prodId,
      { totalRatings: actualRating },
      { new: true }
    );
    res.json(updatedRatings);
  } catch {}
});

const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
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
    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      { new: true }
    );
    res.json(findProduct);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
  addToWishHandler,
  ratings,
  uploadImages,
};
