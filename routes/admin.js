const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Inquiry = require("../models/Inquiry");
const auth = require("../middleware/auth");

/* ===============================
   ADMIN STATS
   GET /api/admin/stats
================================ */
router.get("/stats", auth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verified: true });
    const totalInquiries = await Inquiry.countDocuments();

    res.json({
      totalUsers,
      verifiedUsers,
      inquiries: totalInquiries,
    });
  } catch (err) {
    console.error("Admin stats error:", err.message);
    res.status(500).json({ message: "Admin stats error" });
  }
});

/* ===============================
   ALL USERS
   GET /api/admin/users
================================ */
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const formattedUsers = users.map((u) => ({
      email: u.email,
      verified: u.verified,
      loginMethod: u.loginMethod || "OTP",
      hasPassword: !!u.password,
      profileCompleted: u.profileCompleted || false,
      createdAt: u.createdAt,
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error("Admin users error:", err.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ===============================
   ALL INQUIRIES
   GET /api/admin/inquiries
================================ */
router.get("/inquiries", auth, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    console.error("Admin inquiries error:", err.message);
    res.status(500).json({ message: "Failed to fetch inquiries" });
  }
});

module.exports = router;
