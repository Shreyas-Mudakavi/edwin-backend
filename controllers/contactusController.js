const contactusModel = require("../models/contactusModel");

exports.addContactus = catchAsyncError(async (req, res, next) => {
  const { firstname, lastname, email, mobile_no, topic, message } = req.body;

  if (mobile_no < 10) {
    return next(
      new ErrorHandler("Mobile must be atleast 10 characters long!", 401)
    );
  }

  const addContactus = await contactusModel.create({
    firstname,
    lastname,
    email,
    mobile_no,
    topic,
    message,
  });

  const savedContactus = await addContactus.save();

  res.status(200).json({ msg: "Query submitted!" });
});
