const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Inquiry = require("../models/Inquiry");
const auth = require("../middleware/auth");

// GET /api/admin/stats
router.get("/stats", auth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verified: true });
    const totalInquiries = await Inquiry.countDocuments();

    const recentInquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      verifiedUsers,
      totalInquiries,
      recentInquiries
    });
  } catch (err) {
    console.error("Admin stats error:", err.message);
    res.status(500).json({ message: "Admin stats error" });
  }
});

module.exports = router;
