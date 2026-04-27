const { envPath } = require("./lib/loadEnv");
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = 'http://localhost:3000/api';

async function runTest() {
  try {
    console.log(`Loaded environment from: ${envPath}`);
    console.log(`JWT secret loaded: ${Boolean(process.env.JWT_SECRET)}`);
    console.log("🚀 Starting Full System Test...");

    // 1. REGISTER
    console.log("\n1️⃣ Registering User...");
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email: "dev_test@shieldledger.com",
        password: "secure_password_123",
        org_name: "Google Solutions Team"
      });
      console.log("✅ Registration Successful (or user already exists).");
    } catch (e) {
      console.log("ℹ️ Note: Registration skipped (user likely exists).");
    }

    // 2. LOGIN
    console.log("\n2️⃣ Logging in...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: "dev_test@shieldledger.com",
      password: "secure_password_123"
    });
    const token = loginRes.data.token;
    console.log("✅ Login Successful. Token received.");

    // 3. UPLOAD (SIMULATED)
    console.log("\n3️⃣ Uploading Document...");
    // Create a dummy file for testing
    fs.writeFileSync('test_document.txt', 'This is a secure ledger document.');
    
    const form = new FormData();
    form.append('file', fs.createReadStream('test_document.txt'));

    const uploadRes = await axios.post(`${API_URL}/documents/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    const docId = uploadRes.data.document.id;
    const docHash = uploadRes.data.document.hash;
    console.log(`✅ Upload Successful! Document ID: ${docId}`);
    console.log(`✅ SHA-3 Hash: ${docHash}`);
    console.log("⏳ Waiting for Anchor Worker to confirm (approx 2s)...");

    // 4. VERIFY (Wait 3 seconds to ensure worker finished)
    setTimeout(async () => {
      console.log("\n4️⃣ Verifying Document Integrity...");
      const verifyRes = await axios.post(`${API_URL}/verify`, {
        hash: docHash
      });

      if (verifyRes.data.authentic) {
        console.log("✅ VERIFICATION SUCCESS: Document is authentic!");
        console.log(`📊 Status: ${verifyRes.data.details.status}`);
      } else {
        console.log("❌ VERIFICATION FAILED: Hash not found.");
      }
      
      // Cleanup
      fs.unlinkSync('test_document.txt');
      console.log("\n🏁 Test Completed Successfully.");
    }, 3000);

  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(error.response?.data || error.message);
  }
}

runTest();