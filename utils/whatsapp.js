async function sendWhatsApp(message) {
  console.log("FROM:", process.env.TWILIO_WHATSAPP);
  console.log("TO:", process.env.ADMIN_WHATSAPP);

  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP,
    to: process.env.ADMIN_WHATSAPP,
    body: message,
  });
}
