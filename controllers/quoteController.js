const intermediaryClientModel = require("../models/intermediaryClientModel");
const quoteModel = require("../models/quoteModel");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const sendMail = require("../utils/sendMail");

exports.addQuote = catchAsyncError(async (req, res, next) => {
  const { firstname, lastname, email, mobile_no, details } = req.body;

  console.log(req.body);

  const addQuote = await quoteModel.create({
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
  const intermediaryClient = await intermediaryClientModel.find({
    intermediary: req.userId,
  });

  const quotes = await quoteModel.find({
    user: intermediaryClient.map((user) => user.user),
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

  await sendMail(response);

  res.status(200).json({ msg: "Response sent" });
});
