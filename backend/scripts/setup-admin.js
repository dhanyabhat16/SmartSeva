/**
 * Setup Admin Account Script
 * 
 * This script helps you create an admin account with a proper password hash.
 * 
 * Usage:
 *   node scripts/setup-admin.js <email> <password> [role] [dept_id]
 * 
 * Examples:
 *   node scripts/setup-admin.js admin@test.com admin123 SUPER_ADMIN
 *   node scripts/setup-admin.js dept@test.com dept123 DEPT_ADMIN 1
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function setupAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node setup-admin.js <email> <password> [role] [dept_id]');
    console.log('');
    console.log('Examples:');
    console.log('  node setup-admin.js admin@test.com admin123 SUPER_ADMIN');
    console.log('  node setup-admin.js dept@test.com dept123 DEPT_ADMIN 1');
    console.log('');
    console.log('Roles: SUPER_ADMIN, DEPT_ADMIN');
    console.log('Department IDs: 1=Electricity, 2=Gas, 3=Bus, 4=Water');
    process.exit(1);
  }

  const email = args[0];
  const password = args[1];
  const role = args[2] || 'SUPER_ADMIN';
  const deptId = args[3] ? parseInt(args[3]) : null;

  if (!['SUPER_ADMIN', 'DEPT_ADMIN'].includes(role)) {
    console.error('Invalid role. Use SUPER_ADMIN or DEPT_ADMIN');
    process.exit(1);
  }

  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'citizens',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to database...');

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT citizen_id, email FROM Citizen WHERE email = ?',
      [email]
    );

    let citizenId;

    if (existingUsers.length > 0) {
      // User exists, use existing citizen_id
      citizenId = existingUsers[0].citizen_id;
      console.log(`User ${email} already exists (ID: ${citizenId})`);
      
      // Update password
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.execute(
        'UPDATE Citizen SET password = ? WHERE citizen_id = ?',
        [hashedPassword, citizenId]
      );
      console.log('Password updated');
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await connection.execute(
        `INSERT INTO Citizen (name, email, password, phone, aadhaar, address, pin) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Admin User', email, hashedPassword, '9999999999', '999999999999', 'Admin Address', '560001']
      );
      citizenId = result.insertId;
      console.log(`New user created with ID: ${citizenId}`);
    }

    // Check if already admin
    const [existingAdmin] = await connection.execute(
      'SELECT admin_id FROM Admin WHERE citizen_id = ?',
      [citizenId]
    );

    if (existingAdmin.length > 0) {
      // Update admin role
      await connection.execute(
        'UPDATE Admin SET role = ?, dept_id = ? WHERE citizen_id = ?',
        [role, deptId, citizenId]
      );
      console.log('Admin role updated');
    } else {
      // Add to Admin table
      await connection.execute(
        'INSERT INTO Admin (citizen_id, dept_id, role) VALUES (?, ?, ?)',
        [citizenId, deptId, role]
      );
      console.log('User added to Admin table');
    }

    // Get department name if applicable
    let deptName = 'All Departments';
    if (deptId) {
      const [dept] = await connection.execute(
        'SELECT dept_name FROM Department WHERE dept_id = ?',
        [deptId]
      );
      if (dept.length > 0) {
        deptName = dept[0].dept_name;
      }
    }

    console.log('');
    console.log('✅ Admin account setup complete!');
    console.log('');
    console.log('Login Details:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role: ${role}`);
    console.log(`  Department: ${deptName}`);
    console.log('');
    console.log('Next Steps:');
    console.log('  1. Start your backend: cd backend && npm start');
    console.log('  2. Start your frontend: cd frontend && npm start');
    console.log('  3. Go to http://localhost:3000/login');
    console.log('  4. Login with the credentials above');
    console.log('  5. Navigate to http://localhost:3000/admin');

    await connection.end();
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();

