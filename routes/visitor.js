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

/* DELETE VISITOR ⭐ ADD THIS */
router.delete("/:id", async (req, res) => {
  try {

    const deleted = await Visitor.findByIdAndDelete(req.params.id);

    if(!deleted){
      return res.status(404).json({
        message: "Visitor not found"
      });
    }

    res.json({ success:true });

  } catch (err) {
    res.status(500).json({
      message: "Delete failed"
    });
  }
});

module.exports = router;
