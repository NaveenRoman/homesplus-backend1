/*********************************
 * 1️⃣ ENV MUST LOAD FIRST
 *********************************/
require("dotenv").config();

/*********************************
 * 2️⃣ IMPORTS (NO DUPLICATES)
 *********************************/
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");

const authMiddleware = require("./middleware/auth");
const User = require("./models/User");
const Inquiry = require("./models/Inquiry");
const sendOTPEmail = require("./utils/email");
const adminRoutes = require("./routes/admin");

/*********************************
 * 3️⃣ APP INITIALIZATION (BEFORE app.use)
 *********************************/
const app = express();

/*********************************
 * 4️⃣ GLOBAL MIDDLEWARE
 *********************************/
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://iridescent-bienenstitch-13ec8f.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/*********************************
 * 5️⃣ DEBUG ENV (SAFE)
 *********************************/
console.log(
  "SENDGRID_API_KEY:",
  process.env.SENDGRID_API_KEY ? "LOADED" : "NOT LOADED"
);
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

/*********************************
 * 6️⃣ SENDGRID CONFIG
 *********************************/
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/*********************************
 * 7️⃣ DATABASE CONNECTION
 *********************************/
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

/*********************************
 * 8️⃣ HEALTH CHECK
 *********************************/
app.get("/", (req, res) => {
  res.send("HomesPlus Backend Running");
});

/*********************************
 * 9️⃣ SEND OTP
 *********************************/
app.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    let user = await User.findOne({ email });
    if (!user) user = new User({ email });

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.verified = false;
    await user.save();

    await sendOTPEmail(email, otp);
    console.log(`📧 OTP sent to ${email}: ${otp}`);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ SEND OTP ERROR:", error.message);
    res.status(500).json({ message: "OTP generated but email failed" });
  }
});

/*********************************
 * 🔟 VERIFY OTP
 *********************************/
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(401).json({ message: "Invalid OTP" });

    if (user.otpExpires < new Date())
      return res.status(401).json({ message: "OTP expired" });

    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "OTP verified successfully", token });
  } catch (error) {
    console.error("❌ VERIFY OTP ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/*********************************
 * 🔐 PROTECTED PROFILE
 *********************************/
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-otp -otpExpires"
    );
    res.json({ message: "Profile fetched", user });
  } catch {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

/*********************************
 * 📩 PROPERTY INQUIRY
 *********************************/
app.post("/api/inquiry", async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;
    if (!propertyId || !name || !email || !phone || !message)
      return res.status(400).json({ message: "All fields are required" });

    const inquiry = new Inquiry({
      propertyId,
      name,
      email,
      phone,
      message,
    });
    await inquiry.save();

    await sgMail.send({
      to: process.env.ADMIN_EMAIL,
      from: process.env.EMAIL_FROM,
      subject: `🏠 New Property Inquiry (${propertyId})`,
      html: `
        <h3>New Inquiry</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p>${message}</p>
      `,
    });

    res.json({ message: "Inquiry sent successfully" });
  } catch (error) {
    console.error("❌ INQUIRY ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/*********************************
 * 🛠 ADMIN ROUTES
 *********************************/
app.use("/api/admin", adminRoutes);

/*********************************
 * 🚀 START SERVER (LAST)
 *********************************/
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
