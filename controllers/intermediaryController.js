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
  const { time } = req.params;
  const date = new Date();
  date.setHours(24, 0, 0, 0);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  let startDate = new Date(date.getFullYear(), 0, 1);
  var days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
  var week = Math.ceil(days / 7);

  const intermediaryClients = await intermediaryClientModel
    .find({ intermediary: req.user })
    .countDocuments();

  const intermediary = await userModel.findOne({
    _id: req.user,
  });

  console.log(intermediary, time);

  if (time == "all") {
    const clients = await intermediaryClientModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          intermediary: {
            $filter: {
              input: "$intermediary",
              cond: { intermediary: req.user },
            },
          },
        },
      },
    ]);

    // const myQuotes = await quoteModel.aggregate([
    //   {
    //     $group: {
    //       _id: null,
    //       total: { $sum: 1 },
    //     },
    //   },
    //   { $sort: { user: intermediary._id } },
    // ]);
    // const payments = await orderModel.aggregate([
    //   {
    //     $project: {
    //       amount: 1,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       total: { $sum: "$amount" },
    //     },
    //   },
    // ]);
    // const dailyUsers = await userModel.aggregate([
    //   {
    //     $project: {
    //       month: { $month: "$createdAt" },

    //       year: { $year: "$createdAt" },
    //     },
    //   },
    //   {
    //     $match: {
    //       year: year,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$month",
    //       total: { $sum: 1 },
    //     },
    //   },
    //   { $sort: { _id: 1 } },
    // ]);
    // const dailyOrders = await orderModel.aggregate([
    //   {
    //     $project: {
    //       month: { $month: "$createdAt" },

    //       year: { $year: "$createdAt" },
    //     },
    //   },
    //   {
    //     $match: {
    //       year: year,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$month",
    //       total: { $sum: 1 },
    //     },
    //   },
    //   { $sort: { _id: 1 } },
    // ]);
    // const dailyQuantity = await orderModel.aggregate([
    //   {
    //     $project: {
    //       month: { $month: "$createdAt" },

    //       year: { $year: "$createdAt" },
    //       quantity: { $sum: "$products.quantity" },
    //     },
    //   },
    //   {
    //     $match: {
    //       year: year,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$month",
    //       total: { $sum: "$quantity" },
    //     },
    //   },
    //   { $sort: { _id: 1 } },
    // ]);
    // const dailyPayments = await orderModel.aggregate([
    //   {
    //     $project: {
    //       month: { $month: "$createdAt" },

    //       year: { $year: "$createdAt" },
    //       amount: 1,
    //     },
    //   },
    //   {
    //     $match: {
    //       year: year,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$month",
    //       total: { $sum: "$amount" },
    //     },
    //   },
    //   { $sort: { _id: 1 } },
    // ]);
    return res.send({
      clients: clients,
      // myQuotes: myQuotes,
      // payments: payments,
      // orders: orders,
      // quantity: quantity,
      // dailyUsers,
      // dailyOrders,
      // dailyQuantity,
      // dailyPayments,
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
