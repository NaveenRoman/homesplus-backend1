const express = require("express");
const router = express.Router();

const Favorite = require("../models/favorite");
const Property = require("../models/Property");

/* ===============================
   ADD FAVORITE
================================ */
router.post("/", async (req, res) => {
  try {

    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID required" });
    }

    // prevent duplicate favorites
    const existing = await Favorite.findOne({ propertyId });
    if (existing) {
      return res.json({ message: "Already added" });
    }

    const fav = new Favorite({ propertyId });
    await fav.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: "Save failed" });
  }
});


/* ===============================
   GET ALL FAVORITES
================================ */
router.get("/", async (req, res) => {
  try {

    const favorites = await Favorite.find()
      .populate("propertyId")
      .sort({ createdAt: -1 });

    const result = favorites.map(f => ({
      _id: f._id,
      propertyName: f.propertyId?.title || "Unknown",
      createdAt: f.createdAt
    }));

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
});


/* ===============================
   DELETE FAVORITE
================================ */
router.delete("/:id", async (req, res) => {
  try {
    await Favorite.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
