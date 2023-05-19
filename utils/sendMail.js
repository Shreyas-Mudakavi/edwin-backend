const nodemailer = require("nodemailer");
const orderModel = require("../models/orderModel");

const sendMail = async (response) => {
  try {
    let transporter = await nodemailer.createTransport({
      // service: "gmail",
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "joelle.bailey@ethereal.email",
        pass: "nt2rf6Xj4ry7NN7sqZ",
      },
    });

    const mailOptions = {
      from: "<katelin.lang94@ethereal.email>",
      to: "shreyasmudak@gmail.com",
      subject: "Hello from gmail using API",
      //   text: "This email is sent to you using gmail API",
      html: `<html>
      <body>
      <p>
      ${response}
      </p>
      </body>
      </html>`,
      //   html: `
      //   <html>
      //   <body>
      //   <h1>Order number : ${orderId}</h1>
      //   ${details?.map((detail) => {
      //     return <p>detail?.quantity</p>;
      //   })}
      //   </body>
      //   </html>
      //   `,
      //   <p> Quantity: ${quantity} </p>
      //     <p> Name: ${name} </p>
      //       <h3> Total:  ${amount} </h3>
      //   amp: `<!doctype html>
      //     <html>
      //     <body>
      //        <p> Quantity: ${details?.quantity} </p>
      //        <p> Name: ${details?.product?.name} </p>
      //        <h3> Total:  ${details?.quantity * details?.product?.amount} </h3>
      //     </body>
      //     </html>

      //   `,
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
