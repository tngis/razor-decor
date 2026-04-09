/**
 * Create Admin User Script
 * Run: node scripts/create-admin.js
 *
 * This script creates an admin user in Firebase Auth and Firestore
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdminUser() {
  console.log('👤 Create Admin User\n');

  try {
    const phoneNumber = await question('Enter phone number (e.g., +97688887777): ');
    const pin = await question('Enter PIN (4 digits): ');
    const displayName = await question('Enter display name (optional): ');
    const email = await question('Enter email (optional): ');

    // Validate inputs
    if (!phoneNumber.startsWith('+')) {
      throw new Error('Phone number must start with country code (e.g., +976)');
    }
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      throw new Error('PIN must be exactly 4 digits');
    }

    console.log('\n🔄 Creating user...');

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      phoneNumber: phoneNumber,
      displayName: displayName || undefined,
      email: email || undefined
    });

    console.log('✓ User created in Firebase Auth');

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      phoneNumber: phoneNumber,
      displayName: displayName || null,
      email: email || null,
      pin: pin, // ⚠️ Should be hashed in production!
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✓ User document created in Firestore');

    console.log('\n✅ Admin user created successfully!\n');
    console.log('User Details:');
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Phone: ${phoneNumber}`);
    console.log(`   Display Name: ${displayName || 'N/A'}`);
    console.log(`   Email: ${email || 'N/A'}`);
    console.log(`   Role: admin`);
    console.log(`   PIN: ${pin}\n`);
    console.log('🎯 You can now login with these credentials!\n');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdminUser();
