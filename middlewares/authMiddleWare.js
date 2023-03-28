const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleWare = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KET);
        const user = await User.findById(decoded.id);
        req.user = user;
        next();
      }
    } catch (err) {
      throw new Error("Not authorized, token failed");
    }
  } else {
    throw new Error("Not authorized, token failed");
  }
});
// isAdmin
const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (adminUser.role !== "admin") {
    throw new Error("you are not authorized to do that action");
  } else {
    next();
  }
});

module.exports = {
  authMiddleWare,
  isAdmin,
};
