const { envPath } = require("./lib/loadEnv");
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = 'http://localhost:3000/api';

async function runTest() {
  try {
    console.log(`Loaded environment from: ${envPath}`);
    console.log(`JWT secret loaded: ${Boolean(process.env.JWT_SECRET)}`);
    console.log("🚀 Starting Full System Test (CUID Sync Version)...");

    // 1. LOGIN (Using Seeded User)
    console.log("\n1️⃣ Logging in as Seeded User...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: "priya@meridianclinic.com", //
      password: "demo1234"             //
    });
    const token = loginRes.data.token;
    console.log("✅ Login Successful. Token received.");

    // 2. UPLOAD
    console.log("\n2️⃣ Uploading Test Document...");
    fs.writeFileSync('test_document.txt', 'ShieldLedger Final Demo Integration Test.');

    const form = new FormData();
    form.append('file', fs.createReadStream('test_document.txt'));
    form.append('title', 'API Integration Test Doc');
    form.append('document_type', 'test_report'); // New field requirement

    const uploadRes = await axios.post(`${API_URL}/documents/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    // Match the new schema field names
    const docId = uploadRes.data.document.id;
    const docHash = uploadRes.data.document.sha3_hash; // Changed from .hash to .sha3_hash

    console.log(`✅ Upload Successful! Document ID (CUID): ${docId}`);
    console.log(`✅ SHA-3 Hash: ${docHash}`);
    console.log("⏳ Waiting for Anchor Worker to process transaction (4s)...");

    // 3. VERIFY
    setTimeout(async () => {
      try {
        console.log("\n3️⃣ Verifying Document Integrity...");
        // Ensure this matches your verify route (might be POST /verify or GET /verify/:hash)
        const verifyRes = await axios.post(`${API_URL}/verify`, {
          hash: docHash
        });

        if (verifyRes.data.authentic) {
          console.log("✅ VERIFICATION SUCCESS: Document is authentic!");
          console.log(`📊 Current Status: ${verifyRes.data.details.status}`);
          console.log(`🔗 Tx Hash: ${verifyRes.data.details.anchor_event?.tx_hash || 'Pending...'}`);
        } else {
          console.log("❌ VERIFICATION FAILED: Hash not found.");
        }
      } catch (err) {
        console.error("❌ Verification Step Error:", err.response?.data || err.message);
      } finally {
        fs.unlinkSync('test_document.txt');
        console.log("\n🏁 Test Sequence Finished.");
      }
    }, 4000);

  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(error.response?.data || error.message);
  }
}

runTest();