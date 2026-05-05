const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dns = require('node:dns');

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

const MONGODB_URI = env.MONGODB_URI;

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

async function debug() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: "servicehub", family: 4 });
    const db = mongoose.connection.db;
    
    // Simulations parameters (Suresh Kumar)
    const workerCat = "AC Service";
    const workerCity = "Ranchi";
    
    const categoryMap = {
      "AC Service": ["ac", "AC Service"],
      "Plumbing": ["plumbing", "Plumbing"],
      "Cleaning": ["cleaning", "Cleaning"],
      "Painting": ["painting", "Painting"],
      "Electrical": ["electrical", "Electrical"],
      "Carpentry": ["carpentry", "furniture", "Carpentry"],
      "Furniture": ["furniture", "carpentry", "Furniture"]
    };

    const searchCategories = categoryMap[workerCat] || [workerCat];
    const categoryRegex = new RegExp(`^(${searchCategories.join('|')})$`, 'i');
    const cityRegex = new RegExp(workerCity.split(',')[0].trim(), 'i');

    console.log("SIMULATING QUERY:", { categoryRegex, cityRegex });

    // Step 1: Find ALL pending bookings
    const allPending = await db.collection('bookings').find({ 
        workerId: null, 
        status: "pending" 
    }).toArray();
    
    console.log(`\nFound ${allPending.length} TOTAL pending bookings with workerId: null`);
    
    allPending.forEach(b => {
        const catMatch = categoryRegex.test(b.serviceCategory || "");
        const cityMatch = cityRegex.test(b.address?.city || "");
        console.log(`Evaluating ${b._id}:`);
        console.log(`  Cat: "${b.serviceCategory}" -> Match: ${catMatch}`);
        console.log(`  City: "${b.address?.city}" -> Match: ${cityMatch}`);
    });

    // Step 2: Run the actual query used in the API
    const matched = await db.collection('bookings').find({
        workerId: null,
        status: "pending",
        serviceCategory: { $regex: categoryRegex.source, $options: 'i' },
        "address.city": { $regex: cityRegex.source, $options: 'i' }
    }).toArray();

    console.log(`\nQUERY RESULT: ${matched.length} matches found.`);
    if (matched.length > 0) {
        matched.forEach(m => console.log(` - Matched: ${m._id} (${m.serviceCategory})`));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

debug();
