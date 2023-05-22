const nodemailer = require("nodemailer");

const sendMail = async (response) => {
  try {
    let transporter = await nodemailer.createTransport({
      // service: "gmail",
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "katelin.lang94@ethereal.email",
        pass: "BGCmxcgN1J7MX7m84X",
      },
    });

    const mailOptions = {
      from: "<katelin.lang94@ethereal.email>",
      to: "shreyasmudak@gmail.com",
      subject: "Hello from admin for quote response",
      text: `${response}`,
      html: `<html>
      <body>
      <h1>
      ${response}
      </h1>
      </body>
      </html>`,
    };

    let info = await transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.log("err ", err);
      } else {
        console.log("mail sent");
      }
    });

    console.log("Message sent ", info);
  } catch (error) {
    console.log("err ", err);
  }
};

module.exports = sendMail;
