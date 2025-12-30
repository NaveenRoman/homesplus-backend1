const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

async function sendWhatsApp(message) {
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP,
    to: process.env.ADMIN_WHATSAPP,
    body: message,
  });
}

module.exports = sendWhatsApp;
