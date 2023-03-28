const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbId");

const createBrand = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.create(req.body);
    res.json(brand);
  } catch (err) {
    throw new Error(err);
  }
});

const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      {
        title: req.body.title,
      },
      { new: true }
    );
    res.json(updatedBrand);
  } catch (err) {
    throw new Error(err);
  }
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await Brand.findByIdAndDelete(id);
    res.json("this Brand had been deleted");
  } catch (err) {
    throw new Error(err);
  }
});

const getBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const brand = await Brand.findById(id);
    res.json(brand);
  } catch (err) {
    throw new Error(err);
  }
});

const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Brand.find({});
    res.json(categories);
  } catch (err) {
    throw new Error(err);
  }
});
module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getAllCategories,
};
