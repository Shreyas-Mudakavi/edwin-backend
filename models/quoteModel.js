const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Please enter firstname."],
    },
    lastname: {
      type: String,
      required: [true, "Please enter lastname."],
    },
    email: {
      type: String,
      required: [true, "Please enter email."],
    },
    mobile_no: {
      type: String,
      required: [true, "Please enter your mobile number."],
    },
    details: {
      type: String,
      required: [true, "Please enter your service requirement details."],
    },
  },
  { timestamps: true }
);

const quoteModel = mongoose.model("quotes", quoteSchema);

module.exports = quoteModel;
