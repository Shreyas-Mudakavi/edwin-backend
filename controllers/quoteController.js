const intermediaryClientModel = require("../models/intermediaryClientModel");
const quoteModel = require("../models/quoteModel");
const quoteResponseModel = require("../models/quoteResponseModel");
const userModel = require("../models/userModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const sendMail = require("../utils/sendMail");
const sendNotification = require("../utils/sendNotification");

exports.addQuote = catchAsyncError(async (req, res, next) => {
  const { firstname, lastname, email, mobile_no, details, quoteDoc } = req.body;

  console.log(req.body);

  const addQuote = await quoteModel.create({
    user: req.userId,
    firstname,
    lastname,
    email,
    mobile_no,
    details,
    quoteDoc,
  });

  const savedQuote = await addQuote.save();

  res.status(200).json({ msg: "Request submitted!" });
});

exports.getQuotes = catchAsyncError(async (req, res, next) => {
  // const userCount = await userModel.countDocuments();
  // console.log("userCount", userCount);
  // const apiFeature = new APIFeatures(
  //   userModel.find().sort({ createdAt: -1 }),
  //   req.query
  // ).search("firstname");

  // let users = await apiFeature.query;
  // console.log("users", users);
  // let filteredUserCount = users.length;
  // if (req.query.resultPerPage && req.query.currentPage) {
  //   apiFeature.pagination();

  //   console.log("filteredUserCount", filteredUserCount);
  //   users = await apiFeature.query.clone();
  // }
  // console.log("users", users);
  // res.status(200).json({ users, userCount, filteredUserCount });

  const quoteCount = await quoteModel.countDocuments();

  const apiFeature = new APIFeatures(
    quoteModel.find().populate("user").sort({ createdAt: -1 }),
    req.query
  ).search("firstname");

  let quotes = await apiFeature.query;
  let filteredQuoteCount = quotes.length;
  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    quotes = await apiFeature.query.clone();
  }

  if (!quotes) {
    return next(ErrorHandler("No quotes found!", 404));
  }

  res.status(200).json({
    quotes: quotes,
    filteredQuoteCount: filteredQuoteCount,
    quoteCount: quoteCount,
  });
});

exports.getClientQuotes = catchAsyncError(async (req, res, next) => {
  const intermediaryClient = await intermediaryClientModel
    .findOne({
      intermediary: req.userId,
    })
    .populate("user");

  console.log("intermediaryClient ", intermediaryClient);

  // intermediaryClient.forEach(async (client) => {
  const clientQuotes = await quoteModel.aggregate([
    {
      $match: {
        user: { $in: intermediaryClient.user },
      },
    },
    {
      $group: {
        _id: {
          details: "$details",
          firstname: "$firstname",
          lastname: "$lastname",
          email: "$email",
          mobile_no: "$mobile_no",
          quoteStatus: "$quoteStatus",
          paymentStatus: "$paymentStatus",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          _id: "$_id",
        },
        // user: { user: intermediaryClient[0].user._id },
        // details: { details: "$details" },
      },
    },
  ]);

  console.log("aggre ", clientQuotes);

  // const clientQuotesArrya = aggregateLoop.map((clientQuote) => {
  //   return {
  //     firstname: clientQuote._id.firstname,
  //     lastname: clientQuote._id.lastname,
  //     details: clientQuote._id.details,
  //   };
  // });

  // console.log("aggre res ", clientQuotesArrya);
  res.status(200).json({ quotes: clientQuotes });

  // let quotes = [];
  // const newquo = await intermediaryClient.forEach(
  //   async (intermediaryClient) => {
  //     const allQuotes = await quoteModel.find({
  //       user: intermediaryClient.user,
  //     });

  //     if (!allQuotes) {
  //       return next(ErrorHandler("No quotes found!", 404));
  //     }

  //     console.log(allQuotes);
  //     await quotes.push(allQuotes);
  //     return allQuotes;

  //     // res.status(200).json({ quotes: { quotes } });
  //   }
  // );

  // console.log("newquo ", newquo);
  // console.log("quotes ", quotes);
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

  res.status(200).json({ quotes: quotes });
});

exports.getQuote = catchAsyncError(async (req, res, next) => {
  const quote = await quoteModel.findOne({ _id: req.params.id });

  if (!quote) {
    return next(ErrorHandler("No quote found!", 404));
  }

  res.status(200).json({ quote: quote });
});

exports.getClientQuotesInfo = catchAsyncError(async (req, res, next) => {
  console.log(req.params.id);
  const quote = await quoteModel.find({ user: req.params.id });

  console.log(quote);

  if (!quote) {
    return next(ErrorHandler("No quote found!", 404));
  }

  res.status(200).json({ quote: quote });
});

exports.updateQuoteStatus = catchAsyncError(async (req, res, next) => {
  if (req.body.quoteStatus) {
    const quote = await quoteModel.findByIdAndUpdate(
      req.params.id,
      {
        quoteStatus: req.body.quoteStatus,
      },
      { new: true }
    );

    return res.status(200).json({ quoteStatus: "Updated!" });
  } else {
    const quote = await quoteModel.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: req.body.paymentStatus,
      },
      { new: true }
    );

    return res.status(200).json({ paymentStatus: "Updated!" });
  }
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
  const { response, responseDoc } = req.body;

  const quote = await quoteModel.findById(req.params.id);

  if (!quote) {
    return next(ErrorHandler("No quote found!", 404));
  }

  const user = await quote.user;

  const userMail = await userModel.findById(user);

  const name = userMail.firstname + " " + userMail.lastname;

  await sendMail(response, userMail.email, name, responseDoc);

  const quoteRespArray = [
    {
      response: response,
      responseDoc: responseDoc,
    },
  ];

  const newResponse = quoteRespArray.map((response) => {
    return {
      response: response?.response,
      responseDoc: response?.responseDoc,
      from: "admin",
      respondedOn: new Date(),
    };
  });

  const olderQuoteResp = await quoteResponseModel.findOne({
    quote: quote._id,
  });

  if (olderQuoteResp) {
    const quoteResponse = await quoteResponseModel.updateMany({
      $push: {
        response: newResponse[0],
      },
    });
  } else {
    const quoteResponse = await quoteResponseModel.create({
      user: userMail._id,
      quote: quote._id,
      response: newResponse,
    });

    await quoteResponse.save();
  }

  await quoteModel.findByIdAndUpdate(
    req.params.id,
    { quoteStatus: "pending" },
    { new: true }
  );

  const userId = userMail._id;

  // console.log(userMail);

  if (userMail.role === "intermediary") {
    await sendNotification(userId);
  }

  res.status(200).json({ msg: "Response sent" });
});

exports.quoteRespIntermediary = catchAsyncError(async (req, res, next) => {
  console.log(req.user);
  console.log(req.userRole);

  const { response, responseDoc } = req.body;

  const quote = await quoteModel.findById(req.params.id);

  if (!quote) {
    return next(ErrorHandler("No quote found!", 404));
  }

  const user = await quote.user;

  const userMail = await userModel.findById(user);

  const name = userMail.firstname + " " + userMail.lastname;

  await sendMail(response, userMail.email, name, responseDoc);

  const quoteRespArray = [
    {
      response: response,
      responseDoc: responseDoc,
    },
  ];

  const newResponse = quoteRespArray.map((response) => {
    return {
      response: response?.response,
      responseDoc: response?.responseDoc,
      from: req.userRole,
      respondedOn: new Date(),
    };
  });

  console.log("quote id ", quote._id);
  const olderQuoteResp = await quoteResponseModel.findOne({
    quote: quote._id,
  });

  if (olderQuoteResp) {
    const quoteResponse = await quoteResponseModel.updateMany({
      $push: {
        response: newResponse[0],
      },
    });
  } else {
    const quoteResponse = await quoteResponseModel.create({
      user: userMail._id,
      quote: quote._id,
      response: newResponse,
    });

    await quoteResponse.save();
  }

  // await quoteModel.findByIdAndUpdate(
  //   req.params.id,
  //   { quoteStatus: "pending" },
  //   { new: true }
  // );

  res.status(200).json({ msg: "Response sent" });
});

exports.quoteResponses = catchAsyncError(async (req, res, next) => {
  const quote = await quoteModel.findById(req.params.id);

  const allQuoteResp = await quoteResponseModel.findOne({
    quote: quote._id,
  });

  res.status(200).json({ allQuoteResp: allQuoteResp });
});
