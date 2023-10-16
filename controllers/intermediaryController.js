const intermediaryClientModel = require("../models/intermediaryClientModel");
const quoteModel = require("../models/quoteModel");
const userModel = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const bcrypt = require("bcryptjs");

exports.addIntermediaryClient = catchAsyncError(async (req, res, next) => {
  const {
    firstname,
    lastname,
    email,
    mobile_no,
    birthdate,
    technical_contact_email,
    technical_contact_name,
    technical_contact_telephone,
    street_address,
    post_code,
    city,
    country,
    extra_contact_details,
    extra_info_field,
    invoicing_details,
    installation_address,
    password,
  } = req.body;

  const client = await userModel.create({
    firstname,
    lastname,
    email,
    mobile_no,
    birthdate,
    technical_contact_email,
    technical_contact_name,
    technical_contact_telephone,
    street_address,
    post_code,
    city,
    country,
    extra_contact_details,
    extra_info_field,
    invoicing_details,
    installation_address,
    password,
  });

  const savedIntermediaryClient = await client.save();

  const alreadyIntermediartClient = await intermediaryClientModel.findOne({
    intermediary: req.userId,
  });

  if (alreadyIntermediartClient) {
    console.log("already ");
    await intermediaryClientModel.updateOne(
      { intermediary: req.userId },
      {
        $push: {
          user: savedIntermediaryClient._id,
        },
      }
    );
    return res.status(200).json({ msg: "Client added!" });
  } else {
    const intermediaryClient = await intermediaryClientModel.create({
      intermediary: req.userId,
      user: savedIntermediaryClient._id,
    });

    const savedClient = await intermediaryClient.save();
    return res.status(200).json({ msg: "Client added!" });
  }
});

exports.updateIntermediaryClient = catchAsyncError(async (req, res, next) => {
  const {
    firstname,
    lastname,
    email,
    mobile_no,
    birthdate,
    technical_contact_email,
    technical_contact_name,
    technical_contact_telephone,
    street_address,
    post_code,
    city,
    country,
    extra_contact_details,
    extra_info_field,
    invoicing_details,
    installation_address,
    password,
  } = req.body;

  const encryptPw = await bcrypt.hash(password, 11);

  const intermediaryClient = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      firstname,
      lastname,
      email,
      mobile_no,
      birthdate,
      technical_contact_email,
      technical_contact_name,
      technical_contact_telephone,
      street_address,
      post_code,
      city,
      country,
      extra_contact_details,
      extra_info_field,
      invoicing_details,
      installation_address,
      password: encryptPw,
    },
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

exports.getStatistics = catchAsyncError(async (req, res, next) => {
  const intermediary = await userModel.findOne({
    _id: req.user,
  });

  const intermediaryClients = await intermediaryClientModel.findOne({
    intermediary: intermediary?._id,
  });

  let clientQuotes = [];
  if (intermediaryClients?.user) {
    clientQuotes = await quoteModel.aggregate([
      {
        $match: {
          user: { $in: intermediaryClients?.user },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
  }

  const myQuotesCount = await quoteModel.countDocuments({
    user: intermediary?._id,
  });

  res.status(200).json({
    clients: intermediaryClients?.user.length,
    clientQuotes: clientQuotes.length || 0,
    myQuotesCount: myQuotesCount,
  });
});
