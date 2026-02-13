app.post("/api/lead", async (req, res) => {

  const { name, phone, place, propertyId } = req.body;

  const message = `
🏠 New Property Lead

Name: ${name}
Phone: ${phone}
Location: ${place}
Property: ${propertyId}
  `;

  await sendWhatsApp(message);

  res.json({ success: true });
});
