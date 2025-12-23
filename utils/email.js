const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOTPEmail = async (toEmail, otp) => {
  const msg = {
    to: toEmail,
    from: process.env.EMAIL_FROM, // MUST be verified sender
    subject: "Your HomesPlus Login OTP",
    html: `
      <h2>HomesPlus Login</h2>
      <p>Your OTP is:</p>
      <h1 style="letter-spacing:4px">${otp}</h1>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
    `,
  };

  return sgMail.send(msg);
};

module.exports = sendOTPEmail;
