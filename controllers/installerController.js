const installer = require("../models/installersModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

exports.getInstallers = catchAsyncError(async (req, res, next) => {
  const installers = await installer.find();

  if (!installers) {
    return next(new ErrorHandler("No installers added!", 404));
  }

  res.status(200).json(installers);
});

exports.getSearchedInstallers = catchAsyncError(async (req, res, next) => {
  console.log(req.query.name);
  // console.log(req.query.name.charAt(0).toUpperCase() + req.query.name.slice(1));

  const installers = await installer.find({
    name: {
      $regex: req.query.name,
    },
  });

  if (!installers) {
    return next(
      new ErrorHandler("No installer(s) matches with that name!", 404)
    );
  }

  res.status(200).json(installers);
});
