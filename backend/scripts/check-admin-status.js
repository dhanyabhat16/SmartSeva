/**
 * Check Admin Status Script
 * 
 * This script helps diagnose why admin access isn't working.
 * 
 * Usage:
 *   node scripts/check-admin-status.js <email>
 * 
 * Example:
 *   node scripts/check-admin-status.js admin@test.com
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkAdminStatus() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node check-admin-status.js <email>');
    console.log('');
    console.log('Example:');
    console.log('  node check-admin-status.js admin@test.com');
    process.exit(1);
  }

  const email = args[0];

  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'citizens',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔍 Checking admin status for:', email);
    console.log('');

    // Check if user exists
    const [users] = await connection.execute(
      'SELECT citizen_id, name, email FROM Citizen WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log('❌ User not found in Citizen table!');
      console.log('   Please register this user first or check the email.');
      await connection.end();
      process.exit(1);
    }

    const user = users[0];
    console.log('✅ User found:');
    console.log(`   Citizen ID: ${user.citizen_id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log('');

    // Check if user is admin
    const [admins] = await connection.execute(
      `SELECT a.admin_id, a.citizen_id, a.dept_id, a.role, d.dept_name
       FROM Admin a
       LEFT JOIN Department d ON a.dept_id = d.dept_id
       WHERE a.citizen_id = ?`,
      [user.citizen_id]
    );

    if (admins.length === 0) {
      console.log('❌ User is NOT in Admin table!');
      console.log('');
      console.log('🔧 To fix this, run:');
      console.log(`   node scripts/setup-admin.js ${email} <password> SUPER_ADMIN`);
      console.log('');
      console.log('Or manually add to Admin table:');
      console.log(`   INSERT INTO Admin (citizen_id, dept_id, role) VALUES (${user.citizen_id}, NULL, 'SUPER_ADMIN');`);
    } else {
      const admin = admins[0];
      console.log('✅ User IS an admin:');
      console.log(`   Admin ID: ${admin.admin_id}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Department: ${admin.dept_name || 'All Departments (Super Admin)'}`);
      console.log('');
      console.log('✅ Admin status is correct!');
      console.log('');
      console.log('If you still can\'t access admin features:');
      console.log('1. Make sure you\'re logged in with this email');
      console.log('2. Check browser console for errors');
      console.log('3. Verify JWT_SECRET matches in backend .env file');
      console.log('4. Try logging out and logging back in');
    }

    // Test JWT token decoding
    console.log('');
    console.log('🔐 Testing JWT token structure:');
    console.log('   The JWT should contain: { id: citizen_id }');
    console.log(`   Expected citizen_id in token: ${user.citizen_id}`);
    console.log('');
    console.log('   To test, decode your token at: https://jwt.io');
    console.log('   Or check backend logs when accessing /api/admin/profile');

    await connection.end();
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    process.exit(1);
  }
}

checkAdminStatus();

