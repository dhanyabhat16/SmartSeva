# Troubleshooting Admin Access Issues

## Common Issues and Solutions

### Issue 1: "Access denied. Admin privileges required."

**Cause**: The user is not in the Admin table.

**Solution**:
1. Check if user exists in Citizen table:
   ```sql
   SELECT citizen_id, email FROM Citizen WHERE email = 'your-email@example.com';
   ```

2. Check if user is in Admin table:
   ```sql
   SELECT * FROM Admin WHERE citizen_id = YOUR_CITIZEN_ID;
   ```

3. If not in Admin table, add them:
   ```sql
   INSERT INTO Admin (citizen_id, dept_id, role) 
   VALUES (YOUR_CITIZEN_ID, NULL, 'SUPER_ADMIN');
   ```

**Quick Fix Script**:
```bash
cd backend
node scripts/check-admin-status.js your-email@example.com
```

### Issue 2: Can Access Admin Page But No Data Loads

**Possible Causes**:
1. Backend server not running
2. CORS issues
3. API endpoints not responding

**Solution**:
1. Check backend is running: `http://localhost:5000/health`
2. Check browser console for errors
3. Verify API calls in Network tab

### Issue 3: Token Issues

**Symptoms**:
- "Invalid or expired token"
- Redirected to login immediately

**Solution**:
1. Clear browser localStorage:
   ```javascript
   localStorage.clear();
   ```
2. Log out and log back in
3. Check JWT_SECRET in backend `.env` matches

### Issue 4: User Exists But Still Can't Access

**Diagnostic Steps**:

1. **Run the diagnostic script**:
   ```bash
   cd backend
   node scripts/check-admin-status.js your-email@example.com
   ```

2. **Check the JWT token**:
   - Open browser DevTools → Application → Local Storage
   - Copy the `token` value
   - Go to https://jwt.io
   - Paste token and decode
   - Verify the `id` field matches your `citizen_id`

3. **Test the API directly**:
   ```bash
   # Get your token from browser localStorage
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/admin/profile
   ```

4. **Check backend logs**:
   - Look for errors in the terminal where backend is running
   - Check for "Admin auth error" messages

## Step-by-Step Fix

### Step 1: Verify User Exists
```sql
SELECT citizen_id, name, email FROM Citizen WHERE email = 'your-email@example.com';
```

### Step 2: Verify Admin Entry
```sql
SELECT 
  c.citizen_id,
  c.email,
  a.admin_id,
  a.role,
  d.dept_name
FROM Citizen c
LEFT JOIN Admin a ON c.citizen_id = a.citizen_id
LEFT JOIN Department d ON a.dept_id = d.dept_id
WHERE c.email = 'your-email@example.com';
```

### Step 3: If Not Admin, Add to Admin Table
```sql
-- Get citizen_id first
SELECT citizen_id FROM Citizen WHERE email = 'your-email@example.com';

-- Then add (replace CITIZEN_ID with actual number)
INSERT INTO Admin (citizen_id, dept_id, role) 
VALUES (CITIZEN_ID, NULL, 'SUPER_ADMIN');
```

### Step 4: Verify Admin Entry Created
```sql
SELECT * FROM Admin WHERE citizen_id = CITIZEN_ID;
```

### Step 5: Test Login and Access
1. Log out completely
2. Clear browser cache/localStorage
3. Log in again with your credentials
4. Navigate to `http://localhost:3000/admin`

## Using the Setup Script (Easiest Method)

The setup script handles everything automatically:

```bash
cd backend
node scripts/setup-admin.js admin@test.com admin123 SUPER_ADMIN
```

This will:
- ✅ Create/update the user account
- ✅ Hash the password properly
- ✅ Add user to Admin table
- ✅ Set the correct role

## Manual Verification Queries

### Check All Admins
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
ORDER BY a.role, c.name;
```

### Check Specific User's Admin Status
```sql
SELECT 
  c.citizen_id,
  c.email,
  CASE 
    WHEN a.admin_id IS NOT NULL THEN 'YES'
    ELSE 'NO'
  END AS is_admin,
  a.role,
  d.dept_name
FROM Citizen c
LEFT JOIN Admin a ON c.citizen_id = a.citizen_id
LEFT JOIN Department d ON a.dept_id = d.dept_id
WHERE c.email = 'your-email@example.com';
```

## Still Having Issues?

1. **Check Backend Logs**:
   - Look for error messages when accessing `/api/admin/profile`
   - Check for database connection errors
   - Verify JWT_SECRET is set

2. **Check Frontend Console**:
   - Open browser DevTools → Console
   - Look for error messages
   - Check Network tab for failed API calls

3. **Verify Database Connection**:
   - Make sure MySQL is running
   - Verify database credentials in `.env`
   - Test connection: `mysql -u root -p citizens`

4. **Test API Endpoint Directly**:
   ```bash
   # Replace YOUR_TOKEN with actual token from localStorage
   curl -X GET http://localhost:5000/api/admin/profile \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Quick Fix Checklist

- [ ] User exists in Citizen table
- [ ] User has entry in Admin table
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] JWT token is valid (not expired)
- [ ] JWT_SECRET matches in backend
- [ ] Browser localStorage has token
- [ ] No CORS errors in console
- [ ] Database connection is working

