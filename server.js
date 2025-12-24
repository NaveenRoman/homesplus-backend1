require("dotenv").config(); // MUST be first

const authMiddleware = require("./middleware/auth");


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");
const sendOTPEmail = require("./utils/email");

// 🔍 ENV DEBUG (SendGrid)
console.log(
  "SENDGRID_API_KEY:",
  process.env.SENDGRID_API_KEY ? "LOADED" : "NOT LOADED"
);
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

const app = express();
const cors = require("cors");

app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://iridescent-bienenstitch-13ec8f.netlify.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


// 🔌 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) =>
    console.error("❌ MongoDB Error:", err.message)
  );

// 🟢 Health check
app.get("/", (req, res) => {
  res.send("HomesPlus Backend Running");
});

// 🔢 SEND OTP ROUTE
app.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
    }

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.verified = false;
    await user.save();

    // 📧 Send OTP email
    try {
      await sendOTPEmail(email, otp);
      console.log(`📧 OTP sent to ${email}: ${otp}`);
    } catch (mailError) {
      console.error(
        "❌ EMAIL ERROR:",
        mailError.response?.body || mailError.message
      );
      return res.status(500).json({
        message: "OTP generated but email failed",
      });
    }

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ SEND OTP ERROR:", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



// ✅ VERIFY OTP ROUTE
const jwt = require("jsonwebtoken");

app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(401).json({
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < new Date()) {
      return res.status(401).json({
        message: "OTP expired",
      });
    }

    // ✅ Mark verified
    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // 🔐 CREATE JWT TOKEN
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "OTP verified successfully",
      token, // 👈 THIS IS IMPORTANT
    });

  } catch (error) {
    console.error("❌ VERIFY OTP ERROR:", error.message);
    res.status(500).json({
      message: "Server error",
    });
  }
});


// 🔐 PROTECTED PROFILE ROUTE
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-otp -otpExpires");

    res.json({
      message: "Profile data fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
});


const Inquiry = require("./models/Inquiry");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 📩 PROPERTY INQUIRY API
app.post("/api/inquiry", async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    if (!propertyId || !name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save inquiry
    const inquiry = new Inquiry({
      propertyId,
      name,
      email,
      phone,
      message,
    });

    await inquiry.save();

    // Email admin
    await sgMail.send({
      to: process.env.ADMIN_EMAIL,
      from: process.env.EMAIL_FROM,
      subject: `🏠 New Property Inquiry (${propertyId})`,
      html: `
        <h2>New Property Inquiry</h2>
        <p><b>Property ID:</b> ${propertyId}</p>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    });

    res.json({ message: "Inquiry sent successfully" });
  } catch (error) {
    console.error("❌ INQUIRY ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

