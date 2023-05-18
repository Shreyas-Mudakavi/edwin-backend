const userModel = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");

exports.addIntermediaryClient = catchAsyncError(async (req, res, next) => {
  const { firstname, lastname, mobile_no, email, password } = req.body;

  const intermediaryClient = await userModel.create({
    email,
    password,
    firstname,
    lastname,
    mobile_no,
  });

  const savedIntermediaryClient = await intermediaryClient.save();

  res.status(200).json(savedIntermediaryClient);
});
