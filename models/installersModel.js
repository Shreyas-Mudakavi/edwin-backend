const mongoose = require("mongoose");

const installerSchema = new mongoose.Schema(
  {
    ID: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please enter name."],
    },
    email: {
      type: String,
      required: [true, "Please enter email."],
      unique: true,
    },
    mobile: {
      type: String,
      required: [true, "Please enter mobile."],
      unique: true,
    },
    profilePic: {
      type: String,
    },
    location: {
      type: String,
      required: [true, "Location is required."],
    },
    zip: {
      type: String,
      required: [true, "Please enter zip code."],
    },
  },
  { timestamps: true }
);

const installerModel = mongoose.model("installers", installerSchema);

module.exports = installerModel;
