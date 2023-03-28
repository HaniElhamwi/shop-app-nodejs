const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");

const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongodbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./emailCtrl");
const crypto = require("crypto");
const uniqid = require("uniqid");

const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  try {
    const findUser = await User.findOne({ email });
    if (!findUser) {
      // create new user
      const newUser = await User.create(req.body);
      res.json(newUser);
    } else {
      res.json({
        msg: "User already exist",
        success: false,
      });
    }
  } catch (err) {
    throw new Error(err);
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exist
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatch(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser._id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser._id,
      firstname: findUser.firstname,
      lastname: findUser.lastname,
      email: findUser.email,
      mobile: findUser.mobile,
      token: generateToken(findUser._id),
    });
  } else {
    throw new Error("Invalid email or password");
  }
});

// login ADMIN
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exist
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("not authorizes");
  if (findAdmin && (await findAdmin.isPasswordMatch(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateUser = await User.findByIdAndUpdate(
      findAdmin._id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin._id,
      firstname: findAdmin.firstname,
      lastname: findAdmin.lastname,
      email: findAdmin.email,
      mobile: findAdmin.mobile,
      token: generateToken(findAdmin._id),
    });
  } else {
    throw new Error("Invalid email or password");
  }
});

// GET ALL USERS

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch {
    throw new Error(err);
  }
});

// GET SINGLE USER

const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    validateMongodbId(id);
    const getUser = await User.findById(id);
    res.json(req.user);
  } catch (err) {
    throw new Error(err);
  }
});

// DELETE SINGLE USER
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    validateMongodbId(id);
    const deleteUser = await User.findByIdAndDelete(id);
    res.json(deleteUser);
  } catch (err) {
    throw new Error(err);
  }
});

// Handle Refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("no refresh token provided");
  const refreshToken = cookie?.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("no refresh token");
  jwt.verify(refreshToken, process.env.JWT_SECRET_KET, (err, decoded) => {
    if (err || decoded.id !== user.id) {
      throw new Error("some thing wrong happened with the refresh token");
    }
    const accessToken = generateToken(user._id);
    res.json({ accessToken });
  });
});

// lOGOUT
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("no refresh token provided");
  const refreshToken = cookie?.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (user) {
    res.clearCookie("refreshToken", {
      secure: true,
      httpOnly: true,
    });
    res.sendStatus(204);
  }
  await User.findOneAndUpdate(
    refreshToken,
    {
      refreshToken: "",
    },
    { new: true }
  );
});

// UPDATE USER
const updatedUser = asyncHandler(async (req, res) => {
  try {
    validateMongodbId(id);
    const { _id } = req.user;
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    throw new Error(err);
  }
});

// block user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    validateMongodbId(id);
    const blockUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    res.json("user blocked");
  } catch (err) {
    throw new Error(err);
  }
});
// unblock user

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    validateMongodbId(id);
    const blockUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    res.json("user unblocked");
  } catch (err) {
    throw new Error(err);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongodbId(_id);
  try {
    const user = await User.findById(_id);
    if (password) {
      user.password = password;
      const updatedPassword = await user.save();
      res.json(updatedPassword);
    } else {
      res.json("password not updated");
    }
  } catch (err) {
    throw new Error(err);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.find({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    // const token = user.createPasswordResetToken();
    // await user.save();
    // const resetUrl = `Hi , please follow this link to reset yout password this is valid for 10 min from now . <a href='http://localhoset:5000/api/user/reset-password/${token}'>click here</a>`;
    const data = {
      to: email,
      subject: "Forgot Password link",
      html: "<h1>hello</h1>",
      text: "hey user",
    };
    await sendEmail(data);
    res.json("the email was sent");
  } catch {}
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Token is invalid or has expired");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

/// GET WISH LIST

const getWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (err) {
    throw new Error(err);
  }
});

// save user address

const saveAddress = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;

  try {
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req.body.address,
      },
      { new: true }
    );
    res.json(updateUser);
  } catch (err) {
    throw new Error(err);
  }
});

// user cart

const userCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cart } = req.body;
  validateMongodbId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);
    // check already have product in cart
    const alreadyExist = await Cart.findOne({ orderby: user._id });
    if (alreadyExist) {
      alreadyExist.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    let cartTotal = 0;
    for (let j = 0; j < products.length; j++) {
      cartTotal += products[j].price * products[j].count;
    }
    let newCart = await new Cart({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();
    res.json(newCart);
  } catch (err) {
    throw new Error(err);
  }
});

// get user cart
const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product",
      "_id title price totalAfterDiscount"
    );
    res.json(cart);
  } catch (err) {
    throw new Error(err);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json(cart);
  } catch (err) {
    throw new Error(err);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) throw new Error("invalid coupon");

  const user = await User.findOne({ _id: req.user._id });
  let { cartTotal } = await Cart.findOne({ orderby: user._id })
    .populate("products.product")
    .exec();
  console.log(cartTotal);
  console.log(validCoupon);
  console.log(validCoupon.discount);
  let totalAfterDiscount =
    +cartTotal - +(cartTotal * validCoupon.discount) / 100;
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});

const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    if (!COD) throw new Error("create order failed");
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user._id });
    let finalAmount = 0;
    if (!couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount * 100;
    } else {
      finalAmount = userCart.cartTotal * 100;
    }
    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmount,
        status: "cash on delivery",
        create: Date.now(),
        currency: "usd",
      },
      orderedBy: user._id,
      orderStatus: "cash on delivery",
    }).save();
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    res.json({ message: "success" });
  } catch (err) {
    throw new Error(err);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const userOrders = await Order.findOne({ orderby: _id }).populate(
      "products.product"
    );
    res.json(userOrders);
  } catch (err) {
    throw new Error(err);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createUser,
  getAllUsers,
  loginUserCtrl,
  getSingleUser,
  updatedUser,
  deleteUser,
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
  emptyCart,
  getUserCart,
  createOrder,
  applyCoupon,
  getOrders,
  updateOrderStatus,
};
