const intermediaryClientModel = require("../models/intermediaryClientModel");
const userModel = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const bcrypt = require("bcryptjs");

exports.addIntermediaryClient = catchAsyncError(async (req, res, next) => {
  const { firstname, lastname, mobile_no, email, password } = req.body;

  const client = await userModel.create({
    email,
    password,
    firstname,
    lastname,
    mobile_no,
  });

  const savedIntermediaryClient = await client.save();

  const alreadyIntermediartClient = await intermediaryClientModel.findOne({
    intermediary: req.userId,
  });

  if (alreadyIntermediartClient) {
    console.log("already ");
    await intermediaryClientModel.updateOne({
      $push: {
        user: savedIntermediaryClient._id,
      },
    });
    return res.status(200).json({ msg: "Client added!" });
  } else {
    console.log("no already ");
    const intermediaryClient = await intermediaryClientModel.create({
      intermediary: req.userId,
      user: savedIntermediaryClient._id,
    });

    const savedClient = await intermediaryClient.save();
    return res.status(200).json({ msg: "Client added!" });
  }
});

exports.updateIntermediaryClient = catchAsyncError(async (req, res, next) => {
  const { firstname, lastname, mobile_no, email, password } = req.body;

  const encryptPw = await bcrypt.hash(password, 11);

  const intermediaryClient = await userModel.findByIdAndUpdate(
    req.params.id,
    { email, password: encryptPw, firstname, lastname, mobile_no },
    { new: true, runValidators: true }
  );

  res.status(200).json(intermediaryClient);
});

exports.deleteClient = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findOneAndRemove({ _id: id });
  const client = await intermediaryClientModel.findOneAndRemove({ user: id });

  res.status(200).json({
    message: "User Deleted Successfully.",
  });
});
