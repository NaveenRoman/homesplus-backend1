const express = require("express");
const router = express.Router();
const Property = require("../models/Property");

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
   ADD PROPERTY (Admin)
================================ */
router.post("/", async (req, res) => {
  try {
    const newProperty = new Property(req.body);
    await newProperty.save();
    res.json({ message: "Property added", newProperty });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
