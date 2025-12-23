const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Inquiry = require("../models/Inquiry");
const authMiddleware = require("../middleware/auth");

// 🔐 Admin stats (protected)
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verified: true });
    const inquiries = await Inquiry.countDocuments();

    res.json({
      totalUsers,
      verifiedUsers,
      inquiries,
    });
  } catch (error) {
    console.error("❌ ADMIN STATS ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
