const intermediaryClientModel = require("../models/intermediaryClientModel");
const quoteModel = require("../models/quoteModel");
const userModel = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const sendMail = require("../utils/sendMail");
const sendNotification = require("../utils/sendNotification");

exports.addQuote = catchAsyncError(async (req, res, next) => {
  const { firstname, lastname, email, mobile_no, details } = req.body;

  console.log(req.body);

  const addQuote = await quoteModel.create({
    user: req.userId,
    firstname,
    lastname,
    email,
    mobile_no,
    details,
  });

  const savedQuote = await addQuote.save();

  res.status(200).json({ msg: "Request submitted!" });
});

exports.getQuotes = catchAsyncError(async (req, res, next) => {
  const quotes = await quoteModel.find();

  if (!quotes) {
    return next(ErrorHandler("No quotes found!", 404));
  }

  res.status(200).json(quotes);
});

exports.getClientQuotes = catchAsyncError(async (req, res, next) => {
  const intermediaryClient = await intermediaryClientModel.findOne({
    intermediary: req.userId,
  });

  const quotes = await quoteModel.find({
    user: intermediaryClient.user,
  });

  if (!quotes) {
    return next(ErrorHandler("No quotes found!", 404));
  }

  res.status(200).json(quotes);
});

exports.getMyQuotesReq = catchAsyncError(async (req, res, next) => {
  const intermediary = await userModel.findOne({
    _id: req.userId,
  });

  const quotes = await quoteModel.find({
    user: intermediary._id,
    // user: intermediary.map((user) => user.user),
  });

  if (!quotes) {
    return next(ErrorHandler("No quotes found!", 404));
  }

  res.status(200).json(quotes);
});

exports.getQuote = catchAsyncError(async (req, res, next) => {
  const quote = await quoteModel.find({ _id: req.params.id });

  if (!quote) {
    return next(ErrorHandler("No quote found!", 404));
  }

  res.status(200).json(quote);
});

exports.deleteQuote = catchAsyncError(async (req, res, next) => {
  const quote = await quoteModel.findById(req.params.id);

  if (!quote) {
    return next(ErrorHandler("No quote found!", 404));
  }

  await quote.remove();

  res.status(200).json({ msg: "Quote deleted!" });
});

exports.quoteResp = catchAsyncError(async (req, res, next) => {
  const { response } = req.body;

  const quote = await quoteModel.findById(req.params.id);

  if (!quote) {
    return next(ErrorHandler("No quote found!", 404));
  }

  const user = await quote.user;

  const userMail = await userModel.findById(user);

  const name = userMail.firstname + " " + userMail.lastname;

  await sendMail(response, userMail.email, name);

  const userId = userMail._id;

  console.log(userMail);

  if (userMail.role === "intermediary") {
    await sendNotification(userId);
  }

  res.status(200).json({ msg: "Response sent" });
});
