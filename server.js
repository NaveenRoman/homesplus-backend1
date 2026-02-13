require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authMiddleware = require("./middleware/auth");

const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");



const User = require("./models/User");
const Inquiry = require("./models/Inquiry");
const sendOTPEmail = require("./utils/email");
const adminRoutes = require("./routes/admin");

const propertyRoutes = require("./routes/property");

const leadRoutes = require("./routes/lead");




const uploadRoutes = require("./routes/upload");

const visitorRoutes = require("./routes/visitor");





const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json());

app.use(
  cors({
    origin: true, // allow Netlify + localhost
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/* ===============================
   ENV DEBUG
================================ */
console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "LOADED" : "NOT LOADED");
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
console.log("MONGO_URI:", process.env.MONGO_URI ? "LOADED" : "NOT LOADED");

/* ===============================
   SENDGRID
================================ */
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/* ===============================
   DATABASE
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("HomesPlus Backend Running ✅");
});


app.use("/api/properties", propertyRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/lead", leadRoutes);


app.use("/api/visitors", visitorRoutes);

app.use("/api/favorites",
require("./routes/favorite"));

/* ===============================
   SEND OTP
================================ */
app.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    let user = await User.findOne({ email });
    if (!user) user = new User({ email });

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.verified = false;
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err.message);
    res.status(500).json({ message: "OTP generated but email failed" });
  }
});

/* ===============================
   VERIFY OTP
================================ */
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(401).json({ message: "Invalid OTP" });
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
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   PROFILE (PROTECTED)
================================ */
app.get("/api/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-otp -otpExpires");
  res.json(user);
});

/* ===============================
   PROPERTY INQUIRY (PROTECTED)
================================ */
app.post("/api/inquiry", authMiddleware, async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    if (!propertyId || !name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const inquiry = new Inquiry({
      propertyId,
      name,
      email,
      phone,
      message,
    });

    await inquiry.save();

    // Email admin
    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send({
        to: process.env.ADMIN_EMAIL,
        from: process.env.EMAIL_FROM,
        subject: `🏠 New Inquiry (${propertyId})`,
        html: `
          <h3>New Property Inquiry</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p>${message}</p>
        `,
      });
    }

    res.json({ message: "Inquiry sent successfully" });
  } catch (err) {
    console.error("INQUIRY ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADMIN ROUTES
================================ */
app.use("/api/admin", adminRoutes);

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});




/* ===============================
   Whatsapp message
================================ */

const sendWhatsApp = require("./utils/whatsapp");

/*********************************
 * 👀 VISITOR TRACKING
 *********************************/
app.post("/api/visit", async (req, res) => {
  try {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "Unknown";

    const message = `
🏠 HomesPlus Website Visit
👤 New visitor opened the site
🌐 IP: ${ip}
⏰ Time: ${new Date().toLocaleString()}
    `;

    await sendWhatsApp(message);

    res.json({ success: true });
  } catch (error) {
    console.error("WhatsApp alert failed:", error.message);
    res.status(500).json({ message: "Alert failed" });
  }
});


