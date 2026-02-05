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

    description: String,
    area: String,
    facing: String,
    floor: String,
    type: String,

    pricePerSqft: { type: String, required: true },
    totalCost: { type: String, required: true },

    availability: String,
    phone: String,
    email: String,
    map: String,

    media: [mediaSchema],
  },
  { timestamps: true }
);


module.exports = mongoose.model("Property", propertySchema);
