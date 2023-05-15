const mongoose = require("mongoose");

const intermediariesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a valid name."],
    },
    mobile_no: {
      type: String,
      required: [true, "Please provide a valid phone number."],
    },
    email: {
      type: String,
      required: [true, "Please provide a valid email."],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password."],
      minLength: [8, "Password should have more than 8 characters"],
    },
  },
  { timestamps: true }
);

const intermediariesModel = mongoose.model(
  "intermediaries",
  intermediariesSchema
);

module.exports = intermediariesModel;
