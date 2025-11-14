# Email Configuration Guide for SmartSeva

This guide will help you configure email notifications for the SmartSeva application.

## Quick Setup (Gmail - Recommended for Testing)

### Step 1: Create a Gmail App Password

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to your Google Account: https://myaccount.google.com/
   - Navigate to **Security** → **2-Step Verification**
   - Follow the prompts to enable it

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → **Security** → **App passwords**
   - Select **Mail** and **Other (Custom name)**
   - Enter "SmartSeva" as the name
   - Click **Generate**
   - **Copy the 16-character password** (you'll need this)

### Step 2: Create .env File

1. Navigate to the `backend` folder in your project
2. Create a file named `.env` (if it doesn't exist)
3. Add the following configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=citizens
DB_PORT=3306

# JWT Secret (change this in production)
JWT_SECRET=your-secret-key-change-this-in-production

# Server Port
PORT=5000

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

**Important**: Replace:
- `your-email@gmail.com` with your Gmail address
- `your-16-character-app-password` with the app password you generated
- `your_mysql_password` with your MySQL password
- `your-secret-key-change-this-in-production` with a random secret string

### Step 3: Restart Backend Server

After creating/updating the `.env` file:

```bash
cd backend
# Stop the server (Ctrl+C if running)
npm start
# or
npm run dev
```

### Step 4: Verify Email Configuration

When you start the backend server, you should see one of these messages:

✅ **Success**: `Email service is ready to send emails`
❌ **Error**: `Email service configuration error: ...`

If you see an error, check:
- App password is correct (16 characters, no spaces)
- Gmail address is correct
- 2-Step Verification is enabled

## Alternative Email Providers

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### SendGrid (Production Recommended)

1. Sign up at https://sendgrid.com/
2. Create an API key
3. Configure:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### AWS SES (Amazon Simple Email Service)

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-access-key
SMTP_PASS=your-aws-secret-key
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

## Testing Email Configuration

### Method 1: Check Server Logs

1. Start your backend server
2. Update an application status to "COMPLETED" in the admin dashboard
3. Check the backend console for:
   - `Sending completion email to user@example.com...`
   - `Completion email sent successfully` ✅
   - OR `Email sending failed: ...` ❌

### Method 2: Test with a Real Application

1. Create a test application
2. Update its status to "COMPLETED"
3. Check the email inbox of the citizen who applied
4. You should receive an email notification

### Method 3: Check Admin Dashboard Alert

When you update an application status, the alert message will show:
- ✅ `Status updated successfully. Email notification sent.`
- ⚠️ `Status updated successfully. Email notification failed (check SMTP configuration).`

## Troubleshooting

### Problem: "Email service configuration error"

**Solutions**:
1. Verify your `.env` file exists in the `backend` folder
2. Check that all SMTP variables are set correctly
3. For Gmail: Make sure you're using an App Password, not your regular password
4. Restart the backend server after changing `.env`

### Problem: "Email sending failed: Invalid login"

**Solutions**:
1. **Gmail**: Use App Password, not regular password
2. **Outlook**: May need to enable "Less secure app access" or use App Password
3. Check username and password for typos
4. Verify SMTP host and port are correct

### Problem: "Email sending failed: Connection timeout"

**Solutions**:
1. Check your internet connection
2. Verify firewall isn't blocking port 587
3. Try port 465 with `secure: true` (requires code change)
4. Check if your ISP blocks SMTP ports

### Problem: Emails go to Spam

**Solutions**:
1. Use a professional email service (SendGrid, AWS SES) for production
2. Set up SPF, DKIM, and DMARC records for your domain
3. Avoid using free email services for production
4. Include proper email headers and content

## Security Best Practices

1. **Never commit `.env` to Git**:
   - Add `.env` to `.gitignore`
   - Use `.env.example` as a template

2. **Use App Passwords**:
   - Never use your main email password
   - Generate separate app passwords for each service

3. **Production Setup**:
   - Use professional email services (SendGrid, AWS SES, Mailgun)
   - Set up proper email authentication (SPF, DKIM)
   - Monitor email delivery rates

4. **Environment Variables**:
   - Keep `.env` file secure
   - Use different credentials for development and production
   - Rotate passwords regularly

## Current Email Features

The SmartSeva application sends emails for:

1. **Service Completion**: When an application status is changed to "COMPLETED"
2. **Status Updates**: When application status changes (except PENDING)

Email notifications include:
- Application details
- Service name
- Application ID
- Status information
- Admin remarks (if any)

## Example .env File

Here's a complete example `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mypassword123
DB_NAME=citizens
DB_PORT=3306

# JWT Secret
JWT_SECRET=my-super-secret-jwt-key-change-in-production-12345

# Server Port
PORT=5000

# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=smartseva@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

**Note**: Remove spaces from the app password when pasting (Gmail app passwords have spaces for readability, but you can remove them)

## Need Help?

If you're still having issues:

1. Check the backend console for detailed error messages
2. Verify your `.env` file is in the correct location (`backend/.env`)
3. Make sure you restarted the server after changing `.env`
4. Test with a simple email service first (Gmail) before moving to production services

