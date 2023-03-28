const express = require("express");
const mongoose = require("mongoose");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const dotenv = require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

// routes
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const categoryRouter = require("./routes/prodCategoryRoute");
const blogCategoryRouter = require("./routes/blogCatRoute");
const brandRouter = require("./routes/brandRoute");
const couponRouter = require("./routes/couponRoute");

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) throw err;
    console.log("Connected to MongoDB");
  }
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/api/blog-category", blogCategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT || 4000, () =>
  console.log(`server is running on port ${process.env.PORT}`)
);
