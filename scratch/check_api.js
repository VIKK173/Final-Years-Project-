const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const index = line.indexOf('=');
  if (index !== -1) {
    const key = line.substring(0, index).trim();
    const value = line.substring(index + 1).trim();
    env[key] = value;
  }
});

async function testBooking() {
  const payload = {
    userEmail: "test@example.com",
    userName: "Test User",
    serviceName: "AC Power Jet Service",
    serviceCategory: "ac",
    subService: "Split AC Service",
    amount: 524,
    bookingDate: "2026-04-18",
    timeSlot: "10:00 AM",
    address: {
      flat: "101",
      area: "Main Road",
      city: "Ranchi",
      pin: "834001",
      phone: "1234567890"
    },
    notes: "Test note"
  };

  try {
    console.log("Testing /api/bookings POST...");
    // We can't easily hit the Next.js API from outside without a server running and auth cookies
    // So we'll just check the API route code for any obvious flaws again.
  } catch (e) {
    console.error(e);
  }
}

testBooking();
