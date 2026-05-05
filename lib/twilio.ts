import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  console.warn("Twilio credentials missing in environment variables");
}

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, body: string) {
  try {
    // Ensure number is in E.164 format if it's a 10-digit number
    const formattedTo = to.startsWith('+') ? to : `+91${to}`;
    
    console.log(`Sending SMS to ${formattedTo}: ${body}`);
    
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to: formattedTo,
    });
    
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("Twilio SMS send error:", error);
    return { success: false, error };
  }
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
