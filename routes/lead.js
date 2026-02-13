const express = require("express");
const router = express.Router();
const sendWhatsApp = require("../utils/whatsapp");

router.post("/", async (req, res) => {
  try {
    const { name, phone, place, propertyId } = req.body;

    const message = `
🏠 New Property Lead
👤 Name: ${name}
📱 WhatsApp: ${phone}
📍 Place: ${place}
🔎 Viewing Property ID: ${propertyId}
⏰ Time: ${new Date().toLocaleString()}
    `;

    await sendWhatsApp(message);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: "Error sending lead" });
  }
});

module.exports = router;
