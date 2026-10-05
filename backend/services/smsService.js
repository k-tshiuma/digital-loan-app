/**
 * Send an SMS via Twilio.
 * Falls back to console mock when TWILIO_SID / TWILIO_TOKEN are not set.
 */
async function sendSms(to, message) {
  if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN) {
    console.log(`[SMS MOCK] To: ${to} | Message: ${message}`);
    return { success: true, mock: true };
  }
  const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  try {
    const msg = await twilio.messages.create({ body: message, from: process.env.TWILIO_FROM, to });
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error('[SMS ERROR]', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendSms };
