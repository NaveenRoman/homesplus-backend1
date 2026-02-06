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
   ADD PROPERTY (With Cloudinary)
================================ */
router.post(
  "/",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "media", maxCount: 20 },
  ]),
  async (req, res) => {
    try {
      if (!req.files.coverImage) {
        return res.status(400).json({ message: "Cover image required" });
      }

      const cover = req.files.coverImage[0].path;

      const mediaFiles = req.files.media
        ? req.files.media.map(file => ({
            type: file.mimetype.startsWith("video") ? "video" : "img",
            url: file.path,
          }))
        : [];

      const newProperty = new Property({
        ...req.body,
        coverImage: cover,
        media: mediaFiles,
      });

      await newProperty.save();

      res.json({ message: "Property added", newProperty });

    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
