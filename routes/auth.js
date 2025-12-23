const express = require("express");
const router = express.Router();

const User = require("../models/User");
const mailer = require("../config/mail");
const smsClient = require("../config/sms");

router.post("/register", async (req, res) => {
  const { name, email, phone } = req.body;

  // 1️⃣ Save user to MongoDB
  const user = await User.create({ name, email, phone });

  // 2️⃣ Send EMAIL to you
  await mailer.sendMail({
    from: `"HomesPlus Alert" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: "🚨 New User Registered",
    html: `
      <h3>New User Activity</h3>
      <p>Name: ${name}</p>
      <p>Email: ${email}</p>
      <p>Phone: ${phone}</p>
    `
  });

  // 3️⃣ Send SMS to your phone
  await smsClient.messages.create({
    body: `HomesPlus Alert 🚨
New User Registered
Name: ${name}
Email: ${email}`,
    from: process.env.TWILIO_PHONE,
    to: process.env.ADMIN_PHONE
  });

  res.json({ success: true });
});

module.exports = router;
