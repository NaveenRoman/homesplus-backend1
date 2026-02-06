const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const upload = require("../middleware/upload");

/* ===============================
   GET ALL PROPERTIES
================================ */
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   GET SINGLE PROPERTY
================================ */
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADD PROPERTY (DEBUG VERSION)
================================ */
router.post(
  "/",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "media", maxCount: 20 },
  ]),
  async (req, res) => {
    try {
      console.log("===== DEBUG START =====");
      console.log("BODY:", req.body);
      console.log("FILES:", req.files);
      console.log("===== DEBUG END =====");

      res.json({
        success: true,
        body: req.body,
        files: req.files,
      });

    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
