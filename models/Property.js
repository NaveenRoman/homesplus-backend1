const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["img", "video"],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: String, required: true },
    description: String,
    area: String,
    facing: String,
    floor: String,
    pricePerSqft: String,
    mapLink: String,
    media: [mediaSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
