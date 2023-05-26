const orderModel = require("../models/orderModel");
const {
  categoryModel,
  subCategoryModel,
  productModel,
} = require("../models/productModel");
const userModel = require("../models/userModel");
const staticModel = require("../models/staticModel");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { s3Uploadv2, s3UploadMulti } = require("../utils/s3");
const installerModel = require("../models/installersModel");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

exports.postSingleImage = catchAsyncError(async (req, res, next) => {
  const file = req.file;
  if (!file) return next(new ErrorHandler("Invalid Image", 401));

  const results = await s3Uploadv2(file);
  const location = results.Location && results.Location;
  return res.status(201).json({ data: { location } });
});

exports.postMultipleImages = catchAsyncError(async (req, res, next) => {
  const files = req.files;
  if (files) {
    const results = await s3UploadMulti(files);
    console.log(results);
    let location = [];
    results.filter((result) => {
      location.push(result.Location);
    });
    return res.status(201).json({ data: { location } });
  } else {
    return next(new ErrorHandler("Invalid Image", 401));
  }
});

exports.getAll = catchAsyncError(async (req, res, next) => {
  const { product } = req.query;
  const categories = await categoryModel.find();
  const subCategories = await subCategoryModel.find();
  let products;
  if (product) products = await productModel.find();

  res.status(200).json({ categories, subCategories, products });
});

exports.getStatistics = catchAsyncError(async (req, res, next) => {
  const { time } = req.params;
  const date = new Date();
  date.setHours(24, 0, 0, 0);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  let startDate = new Date(date.getFullYear(), 0, 1);
  var days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
  var week = Math.ceil(days / 7);

  if (time == "all") {
    const users = await userModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const orders = await orderModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const payments = await orderModel.aggregate([
      {
        $project: {
          amount: 1,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const quantity = await orderModel.aggregate([
      {
        $project: {
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]);
    const dailyUsers = await userModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyOrders = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyQuantity = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyPayments = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          amount: 1,
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.send({
      users: users,
      payments: payments,
      orders: orders,
      quantity: quantity,
      dailyUsers,
      dailyOrders,
      dailyQuantity,
      dailyPayments,
    });
  }
  if (time == "daily") {
    const users = await userModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const orders = await orderModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const payments = await orderModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const quantity = await orderModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
            ],
          },
        },
      },
      {
        $addFields: {
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]);
    const dailyUsers = await userModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 6 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyOrders = await orderModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 6 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyPayments = await orderModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 6 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyQuantity = await orderModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 6 } },
            ],
          },
        },
      },
      {
        $addFields: {
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.send({
      users: users,
      payments: payments,
      orders: orders,
      quantity: quantity,
      dailyUsers,
      dailyOrders,
      dailyPayments,
      dailyQuantity,
    });
  }
  if (time == "weekly") {
    const users = await userModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          week: week,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const payments = await orderModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
          amount: 1,
        },
      },
      {
        $match: {
          year: year,
          week: week,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const orders = await orderModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          week: week,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const quantity = await orderModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $match: {
          year: year,
          week: week,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]);
    const dailyUsers = await userModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyOrders = await orderModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyQuantity = await orderModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: "quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyPayments = await orderModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
          amount: 1,
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.send({
      users: users,
      payments: payments,
      orders: orders,
      quantity: quantity,
      dailyUsers,
      dailyOrders,
      dailyQuantity,
      dailyPayments,
    });
  }
  if (time == "monthly") {
    const users = await userModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          month: month,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const orders = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          month: month,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const payments = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          amount: 1,
        },
      },
      {
        $match: {
          year: year,
          month: month,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const quantity = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $match: {
          year: year,
          month: month,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]);
    const dailyUsers = await userModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyOrders = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyQuantity = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyPayments = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          amount: 1,
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.send({
      users: users,
      payments: payments,
      orders: orders,
      quantity: quantity,
      dailyUsers,
      dailyOrders,
      dailyQuantity,
      dailyPayments,
    });
  }
});

exports.addStaticContent = catchAsyncError(async (req, res, next) => {
  const { aboutUs, contactUs } = req.body;

  const staticContent = await staticModel.create({
    aboutUs,
    contactUs: {
      phone: contactUs?.map((c) => c?.phone),
      email: contactUs?.map((c) => c?.email),
      address: contactUs?.map((c) => c?.address),
    },
  });

  const savedStaticContent = await staticContent.save();

  res.status(200).json(savedStaticContent);
});

exports.getStaticContent = catchAsyncError(async (req, res, next) => {
  const staticContent = await staticModel.find();

  res.status(200).json(staticContent);
});

exports.viewStaticContent = catchAsyncError(async (req, res, next) => {
  const staticContent = await staticModel.find({ _id: req.params.id });

  res.status(200).json(staticContent);
});

exports.updateStaticContent = catchAsyncError(async (req, res, next) => {
  const { aboutUs, contactUsPhone, contactUsEmail, contactUsAddr } = req.body;

  const staticContent = await staticModel.findByIdAndUpdate(
    req.params.id,
    {
      aboutUs,
      contactUs: {
        phone: contactUsPhone?.map((c) => c),
        email: contactUsEmail?.map((c) => c),
        address: contactUsAddr?.map((c) => c),
      },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(staticContent);
});

exports.addInstallers = catchAsyncError(async (req, res, next) => {
  const { name, profilePic, location, zip, email, mobile } = req.body;

  const unique_id = uuidv4();
  const id = unique_id.slice(0, 6);

  if (mobile.length < 10) {
    return next(ErrorHandler("Mobile must be atleast 10 charcters long!", 401));
  }

  const oldInstaller = await installerModel.find({ email: email });
  const oldInstallerMobile = await installerModel.find({ mobile: mobile });
  if (oldInstaller) {
    return next(
      ErrorHandler("Installer already exists with the given email.", 409)
    );
  }

  if (oldInstallerMobile) {
    return next(
      ErrorHandler(
        "Installer already exists with the given mobile number.",
        409
      )
    );
  }

  if (mobile.length < 10) {
    return next(ErrorHandler("Mobile must be atleast 10 charcters long!", 401));
  }

  const installer = await installerModel.create({
    ID: `Edwin - ${id}`,
    name,
    email,
    mobile,
    profilePic,
    location,
    zip,
  });

  const savedInstaller = await installer.save();

  res.status(200).json(savedInstaller);
});

exports.getInstallers = catchAsyncError(async (req, res, next) => {
  const installers = await installerModel.find();

  if (!installers) {
    return next(ErrorHandler("No installers found!", 404));
  }

  res.status(200).json(installers);
});

exports.getInstaller = catchAsyncError(async (req, res, next) => {
  const installer = await installerModel.find({ _id: req.params.id });

  if (!installer) {
    return next(ErrorHandler("No installer found!", 404));
  }

  res.status(200).json(installer);
});

exports.updateInstaller = catchAsyncError(async (req, res, next) => {
  const installer = await installerModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(installer);
});

exports.deleteInstaller = catchAsyncError(async (req, res, next) => {
  const installer = await installerModel.findById(req.params.id);

  await installer.remove();

  res.status(200).json({ msg: "Installer deleted!" });
});

exports.addIntermediary = catchAsyncError(async (req, res, next) => {
  const { firstname, lastname, mobile_no, email, password } = req.body;

  const intermediary = await userModel.create({
    email,
    password,
    firstname,
    lastname,
    mobile_no,
    role: "intermediary",
  });

  const savedintermediary = await intermediary.save();

  res.status(200).json(savedintermediary);
});

exports.getAllIntermediaries = catchAsyncError(async (req, res, next) => {
  const intermediaries = await userModel.find({ role: "intermediary" });

  if (!intermediaries) {
    return next(ErrorHandler("No intermediaries found!", 404));
  }

  res.status(200).json(intermediaries);
});

exports.getIntermediary = catchAsyncError(async (req, res, next) => {
  const intermediary = await userModel.find({
    _id: req.params.id,
    role: "intermediary",
  });

  if (!intermediary) {
    return next(ErrorHandler("No intermediary found!", 404));
  }

  res.status(200).json(intermediary);
});

exports.updateIntermediary = catchAsyncError(async (req, res, next) => {
  const { firstname, lastname, mobile_no, email, password } = req.body;

  const encryptPw = await bcrypt.hash(password, 11);

  const intermediary = await userModel.findByIdAndUpdate(
    req.params.id,
    { email, password: encryptPw, firstname, lastname, mobile_no },
    { new: true, runValidators: true }
  );

  res.status(200).json(intermediary);
});

exports.deleteIntermediary = catchAsyncError(async (req, res, next) => {
  const intermediary = await userModel.findById(req.params.id);

  const cart = await cartModel.findOne({ user: intermediary?._id });
  await cart.remove();
  await orderModel.deleteMany({ userId: req.params.id });
  await addressModel.deleteMany({ user: req.params.id });
  await reviewModel.deleteMany({ user: req.params.id });

  await intermediary.remove();

  res.status(200).json({ msg: "Intermediary deleted!" });
});
