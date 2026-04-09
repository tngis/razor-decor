/**
 * Update User Role Script
 * Run: node scripts/update-user-role.js
 *
 * This script updates an existing user's role to admin
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

async function updateUserRole() {
  console.log('🔧 Update User Role\n');

  try {
    const method = await question('Search by (1) Phone Number or (2) User ID? Enter 1 or 2: ');

    let userId;

    if (method === '1') {
      const phoneNumber = await question('Enter phone number (e.g., +97688887777): ');

      console.log('\n🔍 Searching for user...');

      // Get user by phone number
      const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
      userId = userRecord.uid;

      console.log(`✓ Found user: ${userRecord.displayName || phoneNumber}`);
      console.log(`  UID: ${userId}`);
    } else {
      userId = await question('Enter User ID (UID): ');
    }

    const newRole = await question('\nEnter new role (admin/customer): ');

    if (!['admin', 'customer'].includes(newRole)) {
      throw new Error('Invalid role. Must be "admin" or "customer"');
    }

    console.log('\n🔄 Updating user role...');

    // Update user document in Firestore
    await db.collection('users').doc(userId).update({
      role: newRole
    });

    console.log('\n✅ User role updated successfully!\n');
    console.log(`   User ID: ${userId}`);
    console.log(`   New Role: ${newRole}\n`);

  } catch (error) {
    console.error('\n❌ Error updating user role:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

updateUserRole();
