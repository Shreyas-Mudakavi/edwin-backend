const express = require("express");
const { productModel, categoryModel } = require("../models/productModel");
const reviewModel = require("../models/reviewModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsyncError = require("../utils/catchAsyncError");
const installerModel = require("../models/installersModel");
const addressModel = require("../models/addressModel");
const orderModel = require("../models/orderModel");

exports.createProduct = catchAsyncError(async (req, res, next) => {
  const product = await await (
    await productModel.create(req.body)
  ).populate("category");
  res.status(200).json({ product });
});

exports.getAllProducts = catchAsyncError(async (req, res, next) => {
  console.log("req.query", req.query);
  const productCount = await productModel.countDocuments();
  console.log("productCount", productCount);
  const apiFeature = new APIFeatures(
    productModel.find().populate("category").sort({ createdAt: -1 }),
    req.query
  ).search("name");

  let products = await apiFeature.query;
  // console.log("products", products);
  let filteredProductCount = products.length;

  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    console.log("filteredProductCount", filteredProductCount);
    products = await apiFeature.query.clone();
  }

  if (req.query.category) {
    console.log(req.query.category);

    products = await productModel
      .find({ category: req.query.category })
      .populate("category")
      .sort({ createdAt: -1 });
    filteredProductCount = products.length;
  }

  // console.log("prod", products);
  res.status(200).json({ products, productCount, filteredProductCount });
});

exports.getProduct = catchAsyncError(async (req, res, next) => {
  const product = await productModel
    .findById(req.params.id)
    .populate("category");

  res.status(200).json({ product });
});

exports.getProductInfo = catchAsyncError(async (req, res, next) => {
  const product = await productModel
    .findById(req.params.id)
    .populate("category");

  console.log(req.userId);

  const address = await addressModel.find({
    user: req.userId,
    defaultAddress: true,
  });

  const userZipCode = await address[0]?.post_code;

  // const zipCodesArr = Array(Number(userZipCode) + 2, Number(userZipCode) - 2);
  const zipCodeOne = Number(userZipCode) + 5;
  const zipCodeTwo = Number(userZipCode) - 5;

  console.log(zipCodeOne);
  console.log(zipCodeTwo);

  const installers = await installerModel.find({
    $and: [{ zip: { $gte: zipCodeTwo, $lte: zipCodeOne } }],
  });

  res.status(200).json({ product, installers, userZipCode });
});

exports.getRecentProducts = catchAsyncError(async (req, res, next) => {
  const products = await productModel
    .findById(req.params.id)
    .populate("category");
  // .populate("sub_category");

  console.log(req.params.id);

  console.log("prods ", products.category?._id.toString());

  const recentProducts = await productModel.find({
    category: products.category?._id.toString(),
  });

  res.status(200).json({ recentProducts });
});

exports.updateProduct = catchAsyncError(async (req, res, next) => {
  const product = await productModel
    .findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    })
    .populate("category");
  res.status(200).json({ product });
});

exports.updateProductInstallDate = catchAsyncError(async (req, res, next) => {
  const currOrder = await orderModel.findById(req.body.id);

  let index;
  index = await currOrder.products.findIndex(
    (prod) => prod.product._id.toString() === req.params.id
  );

  if (index >= 0) {
    console.log("index ", index);

    currOrder.products[index].assignedInstallationDate = new Date(
      req.body.date
    );
  }

  const savedOrder = await currOrder.save();

  res.status(200).json({ msg: "Date assigned!" });
});

exports.addProductInstaller = catchAsyncError(async (req, res, next) => {
  const currOrder = await orderModel.findById(req.body.id);

  console.log(currOrder);

  let index;
  index = await currOrder.products.findIndex(
    (prod) => prod.product._id.toString() === req.params.id
  );

  if (index >= 0) {
    console.log("index ", index);

    currOrder.products[index].installer = req.body.installer;
  }

  const savedOrder = await currOrder.save();

  res.status(200).json({ msg: "Installer assigned!" });
});

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  let product = await productModel.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product Not Found" });
  }

  await reviewModel.deleteMany({ product });
  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product Deleted successfully.",
  });
});
