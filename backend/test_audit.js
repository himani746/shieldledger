require("dotenv").config();
const prisma = require('./src/lib/prisma');
const jwt = require('jsonwebtoken');

async function run() {
  process.env.PORT = '3001';

  const user = await prisma.user.create({
    data: {
      email: `test_audit_${Date.now()}@example.com`,
      password: 'test',
      org_name: 'Test Org Audit'
    }
  });

  const doc = await prisma.document.create({
    data: {
      title: 'Audit Test Doc',
      hash: 'testhash_audit',
      userId: user.id,
      status: 'uploaded'
    }
  });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

  console.log(`Starting server test on document ${doc.id}...`);

  require('./src/index');

  await new Promise(r => setTimeout(r, 2000));

  const res = await fetch(`http://localhost:3001/api/documents/${doc.id}/audit`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('Status:', res.status);
  console.log('Content-Type:', res.headers.get('content-type'));

  if (res.status === 404) {
    console.log('Response text:', await res.text());
  } else {
    const buffer = await res.arrayBuffer();
    console.log('Buffer length:', buffer.byteLength);

    if (buffer.byteLength > 0 && res.headers.get('content-type') === 'application/pdf') {
      console.log('Valid PDF returned. Test successful.');
    } else {
      console.error('Test failed');
    }
  }

  process.exit(0);
}

run().catch(console.error);
