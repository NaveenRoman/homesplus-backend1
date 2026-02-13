const express = require("express");
const router = express.Router();
const Visitor = require("../models/Visitor");

/* SAVE VISITOR */
router.post("/", async (req, res) => {
  try {
    const visitor = new Visitor(req.body);
    await visitor.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Save failed" });
  }
});

/* GET ALL VISITORS */
router.get("/", async (req, res) => {
  const visitors = await Visitor.find().sort({ createdAt: -1 });
  res.json(visitors);
});

module.exports = router;
