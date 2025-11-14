# How to Access Admin Dashboard

## Overview
The admin dashboard is accessible at `/admin` route. However, you need to:
1. **Login as a regular user first** (using the citizen login)
2. **That user must have an entry in the Admin table** to access admin features

## Quick Setup Steps

### Option 1: Create a New Admin Account (Recommended)

1. **Register a new user** through the frontend:
   - Go to `http://localhost:3000/register`
   - Create an account with email: `admin@smartseva.com` (or any email)
   - Note the password you set

2. **Add the user to Admin table** in MySQL:
   ```sql
   -- First, get the citizen_id of the user you just created
   SELECT citizen_id, email, name FROM Citizen WHERE email = 'admin@smartseva.com';
   
   -- Then, add them as Super Admin (replace CITIZEN_ID with the actual ID)
   INSERT INTO Admin (citizen_id, dept_id, role) 
   VALUES (CITIZEN_ID, NULL, 'SUPER_ADMIN');
   
   -- Or add as Department Admin (replace CITIZEN_ID and DEPT_ID)
   INSERT INTO Admin (citizen_id, dept_id, role) 
   VALUES (CITIZEN_ID, 1, 'DEPT_ADMIN');  -- 1 = Electricity Department
   ```

3. **Login and Access Admin**:
   - Go to `http://localhost:3000/login`
   - Login with the email and password you registered
   - Navigate to `http://localhost:3000/admin`
   - You should now have admin access!

### Option 2: Update Existing Sample Data

The sample data in `database.sql` has placeholder password hashes. To use them:

1. **Update the password** for an existing admin user:
   ```sql
   -- First, hash a password using bcrypt (you'll need to do this in Node.js)
   -- Or use this SQL to update with a known hash
   
   -- For testing, you can use this Node.js script:
   ```

2. **Create a script to set admin password** (see `setup-admin.js` below)

## Step-by-Step Instructions

### Step 1: Ensure Database is Set Up
```sql
-- Run the database.sql file in MySQL Workbench
-- This creates all tables and sample data
```

### Step 2: Create/Update Admin User

**Method A: Using Frontend Registration**
1. Start your frontend: `cd frontend && npm start`
2. Go to `http://localhost:3000/register`
3. Register with:
   - Name: Admin User
   - Email: `admin@test.com`
   - Password: `admin123` (or any password)
   - Fill other required fields
4. Register the account

**Method B: Direct SQL Insert**
```sql
-- Insert a new citizen with a known password hash
-- Password: "admin123" (hashed with bcrypt)
INSERT INTO Citizen (name, dob, gender, age, phone, email, aadhaar, address, pin, password) 
VALUES (
  'Admin User', 
  '1990-01-01', 
  'Male', 
  35, 
  '9999999999', 
  'admin@test.com', 
  '999999999999', 
  'Admin Address', 
  '560001',
  '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq'  -- This is a placeholder, you need real hash
);

-- Get the citizen_id
SELECT citizen_id FROM Citizen WHERE email = 'admin@test.com';

-- Add to Admin table (replace CITIZEN_ID with actual ID)
INSERT INTO Admin (citizen_id, dept_id, role) 
VALUES (CITIZEN_ID, NULL, 'SUPER_ADMIN');
```

### Step 3: Use Setup Script (Easiest Method)

I'll create a setup script that you can run to create an admin account properly.

### Step 4: Access Admin Dashboard

1. **Login**:
   - Go to `http://localhost:3000/login`
   - Enter your admin email and password
   - Click Login

2. **Access Admin Dashboard**:
   - After login, navigate to: `http://localhost:3000/admin`
   - Or click the admin link if available
   - The system will check if you're an admin and grant access

## Admin Roles

### SUPER_ADMIN
- Can access all departments
- Can manage all applications
- Full system access

### DEPT_ADMIN
- Can only access their assigned department
- Can manage applications for their department only
- Limited access based on `dept_id`

## Check Admin Status

To verify if a user is an admin:
```sql
SELECT 
  c.citizen_id,
  c.name,
  c.email,
  a.role,
  d.dept_name
FROM Citizen c
JOIN Admin a ON c.citizen_id = a.citizen_id
LEFT JOIN Department d ON a.dept_id = d.dept_id
WHERE c.email = 'your-email@example.com';
```

## Troubleshooting

### "Access denied. Admin privileges required."
- **Solution**: The user is not in the Admin table
- Add the user to Admin table using the SQL above

### "Invalid credentials" on login
- **Solution**: Password hash doesn't match
- Use the setup script to create a proper admin account

### Can't access `/admin` route
- **Solution**: Make sure you're logged in first
- The admin check happens after login
- Check browser console for errors

## Quick Test

1. Register a new account: `test@admin.com` / `password123`
2. Get citizen_id: `SELECT citizen_id FROM Citizen WHERE email = 'test@admin.com';`
3. Add as admin: `INSERT INTO Admin (citizen_id, role) VALUES (CITIZEN_ID, 'SUPER_ADMIN');`
4. Login and go to `/admin`

## Admin Dashboard Features

Once you access the admin dashboard, you can:
- View dashboard statistics
- Manage all applications
- Update application status (triggers email notifications)
- Verify/reject documents
- Resolve grievances
- View department-specific data (if DEPT_ADMIN)

