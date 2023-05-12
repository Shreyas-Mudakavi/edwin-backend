const mongoose = require("mongoose");

const staticSchema = new mongoose.Schema(
  {
    aboutUs: {
      type: String,
      required: [true, "Please enter details for About us"],
    },
    contactUs: {
      phone: [
        {
          type: String,
          required: [true, "Phone is required!"],
        },
      ],
      email: [
        {
          type: String,
          required: [true, "Email is required!"],
        },
      ],
      address: [
        {
          type: String,
          required: [true, "Address is required!"],
        },
      ],
    },
  },
  { timestamps: true }
);

const staticModel = mongoose.model("staticContent", staticSchema);

module.exports = staticModel;
