// SMS via Twilio
export async function sendSMS(phoneNumber, message) {
  try {
    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('⚠️  Twilio not configured - SMS not sent');
      return { success: false, message: 'Twilio not configured' };
    }

    // For demo: just log the SMS
    console.log(`📱 SMS to ${phoneNumber}: "${message}"`);
    
    // Uncomment to use real Twilio:
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });

    return { success: true, message: 'SMS queued' };
  } catch (error) {
    console.error('SMS error:', error);
    return { success: false, error: error.message };
  }
}

// Stock alert SMS
export async function sendStockAlertSMS(phone, productName) {
  const message = `🎉 ${productName} est de retour en stock! Commander maintenant: tastycrousty.com`;
  return sendSMS(phone, message);
}

// Promotion SMS
export async function sendPromotionSMS(phone, discount) {
  const message = `🎁 Offre flash: ${discount}% de réduction sur Tasty Crousty × Skibiditentation! Code: PROMO${discount}`;
  return sendSMS(phone, message);
}

export default { sendSMS, sendStockAlertSMS, sendPromotionSMS };
