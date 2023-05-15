const installer = require("../models/installersModel");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

exports.getInstallers = catchAsyncError(async (req, res, next) => {
  const installers = await installer.find();

  if (!installers) {
    return next(new ErrorHandler("No installers added!", 404));
  }

  res.status(200).json(installers);
});
