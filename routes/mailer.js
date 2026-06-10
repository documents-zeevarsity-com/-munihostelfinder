const nodemailer = require('nodemailer');

// Configure this with your actual SMTP details in .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a booking confirmation email
 * @param {string} to - Recipient email
 * @param {Object} details - Booking details
 */
const sendBookingEmail = async (to, details) => {
  const mailOptions = {
    from: '"Muni Hostel Finder" <ayiko6810@gmail.com>',
    to: [to, 'ayiko6810@gmail.com'], // Notify both the user and the building/dev email
    subject: `Booking Confirmation: ${details.hostelName}`,
    html: `
      <h1>Booking Confirmed!</h1>
      <p>Hello, your booking for <b>${details.hostelName}</b> has been received.</p>
      <p>Check-in: ${details.checkIn}</p>
      <p>Total Amount: ${details.amount}</p>
    `,
  };
  return transporter.sendMail(mailOptions);
};

/**
 * Send an OTP verification email
 * @param {string} to - Recipient email
 * @param {string} otp - The 6-digit code
 */
const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: '"Muni Hostel Finder" <ayiko6810@gmail.com>',
    to: [to, 'ayiko6810@gmail.com'],
    subject: 'Your Hostel Registration Verification Code',
    html: `
      <h1>Verify Your Registration</h1>
      <p>Thank you for registering as a Hostel Admin. Please use the following code to verify your email address:</p>
      <h2 style="font-size: 2rem; letter-spacing: 5px; color: #a02c2c;">${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
    `,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = { sendBookingEmail, sendOTPEmail };