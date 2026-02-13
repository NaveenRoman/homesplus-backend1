const express = require("express");
const router = express.Router();
const sendWhatsApp = require("../utils/whatsapp");

router.post("/", async (req, res) => {
  try {
    const { name, phone, place, propertyId } = req.body;

    const message = `
🏠 New Property Lead

👤 Name: ${name}
📱 Phone: ${phone}
📍 Location: ${place}
🏢 Property ID: ${propertyId}
    `;

    await sendWhatsApp(message);

    res.json({ success: true });

  } catch (error) {
    console.error("Lead Error:", error.message);
    res.status(500).json({ message: "Lead failed" });
  }
});

module.exports = router;
