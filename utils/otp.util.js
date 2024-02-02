// utils/otp.util.js

const nodemailer = require('nodemailer');
const { GMAIL_EMAIL, GMAIL_PASSWORD } = require('../config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_PASSWORD,
  },
});

exports.generateOTP = (otp_length) => {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < otp_length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

exports.emailToSMS = async ({ message, contactNumber, userEmail }, next) => {
  try {
    // Use the correct email-to-SMS gateway address
    const emailGateway = 'skrai9471930131@gmail.com';

    // Construct the recipient email address by combining the phone number with the gateway
    const recipientAddress = `${emailGateway}`;

    const mailOptions = {
      from: GMAIL_EMAIL,
      to: userEmail, // Use the user's email instead of a fixed email address
      subject: 'SMS Subject',
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log('SMS sent successfully via email-to-SMS gateway');
  } catch (error) {
    next(error);
  }
};
