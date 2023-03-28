const nodeMailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res, next) => {
  console.log("email functioj ");
  let transporter = nodeMailer.createTransport({
    host: "hani@gmial.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "hani elhamwi", // generated ethereal user
      pass: "llsnuebcmjmpisal", // generated ethereal password
    },
  });
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <hanialhamwi000000@example.com>', // sender address
    to: data.to, // list of receivers
    subject: data.subject, // Subject line
    text: data.text, // plain text body
    html: data.html, // html body
  });
  next();
});

module.exports = sendEmail;
