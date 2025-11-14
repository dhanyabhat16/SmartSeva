# SmartSeva Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Database Setup

1. **Create Database**
   - Open MySQL Workbench or MySQL command line
   - Run the SQL file: `backend/database.sql`
   - This will create the database, all tables, triggers, functions, procedures, and sample data

2. **Database Configuration**
   - The SQL file includes:
     - All table schemas
     - Triggers (auto-update completion_date, calculate age)
     - Functions (GetTotalApplications, GetAvgProcessingTime, IsAdmin)
     - Stored Procedures (GetApplicationDetails, UpdateApplicationStatus, GetDashboardStats, etc.)
     - Sample data for testing

## Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the `backend` directory:
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

   # Email Configuration (SMTP)
   # For Gmail, use an App Password: https://support.google.com/accounts/answer/185833
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

3. **Start Backend Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

## Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend Development Server**
   ```bash
   npm start
   ```

## Admin Access

To access the admin dashboard:

1. **Login as Admin**
   - Use one of the sample admin accounts from the database:
     - Email: `amit.kumar@gmail.com` (Super Admin)
     - Email: `priya.sharma@gmail.com` (Department Admin - Gas Supply)
   - Password: You'll need to check/hash passwords in the database

2. **Access Admin Dashboard**
   - Navigate to: `http://localhost:3000/admin`
   - The system will automatically check if the logged-in user has admin privileges

## Email Configuration

1. **Gmail Setup**
   - Go to Google Account settings
   - Enable 2-Step Verification
   - Generate an App Password: https://support.google.com/accounts/answer/185833
   - Use the App Password in `SMTP_PASS` environment variable

2. **Other SMTP Providers**
   - Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` in `.env`
   - Common providers:
     - Gmail: `smtp.gmail.com:587`
     - Outlook: `smtp-mail.outlook.com:587`
     - SendGrid: `smtp.sendgrid.net:587`

## Features

### Database Features
- **Triggers**: Auto-update completion dates and calculate age
- **Functions**: Get total applications, average processing time, check admin status
- **Stored Procedures**: Complex queries for dashboard stats, application details, etc.

### Backend Features
- JWT-based authentication
- Admin authentication middleware
- Email notifications on service completion
- RESTful API for all resources
- File upload support for documents

### Admin Dashboard Features
- Dashboard statistics (total, pending, in-progress, completed applications)
- Application management (view, update status)
- Document verification
- Grievance management
- Department-based access control

### Email Notifications
- Automatic email sent when application status changes to "COMPLETED"
- Email sent for other status updates
- Beautiful HTML email templates

## API Endpoints

### Public Routes
- `POST /api/citizens/register` - Register new citizen
- `POST /api/citizens/login` - Login

### Protected Routes (Citizens)
- `GET /api/citizens/profile` - Get profile
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Create application
- `POST /api/applications/:appId/documents` - Upload document
- `POST /api/applications/:appId/pay` - Process payment
- `GET /api/grievances` - Get grievances
- `POST /api/grievances` - Create grievance

### Admin Routes
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/applications` - Get all applications
- `GET /api/admin/applications/:appId` - Get application details
- `PUT /api/admin/applications/:appId/status` - Update application status
- `GET /api/admin/pending-documents` - Get pending documents
- `PUT /api/admin/documents/:docId/verify` - Verify/reject document
- `GET /api/admin/grievances` - Get grievances
- `PUT /api/admin/grievances/:grievanceId/resolve` - Resolve grievance
- `GET /api/admin/profile` - Get admin profile

## Testing

### Test Admin Login
1. Use the database query to check admin accounts:
   ```sql
   SELECT c.email, c.password, a.role, d.dept_name 
   FROM Citizen c 
   JOIN Admin a ON c.citizen_id = a.citizen_id 
   LEFT JOIN Department d ON a.dept_id = d.dept_id;
   ```

2. Note: Passwords in the sample data are hashed. You'll need to create a new account or update passwords using bcrypt.

## Troubleshooting

1. **Database Connection Error**
   - Check MySQL is running
   - Verify database credentials in `.env`
   - Ensure database `citizens` exists

2. **Email Not Sending**
   - Check SMTP credentials in `.env`
   - For Gmail, ensure App Password is used (not regular password)
   - Check server logs for email errors
   - Email service will log to console if SMTP is not configured

3. **Admin Access Denied**
   - Ensure user is added to Admin table
   - Check user's `citizen_id` matches Admin table
   - Verify JWT token is valid

4. **CORS Errors**
   - Ensure backend CORS is enabled
   - Check frontend API base URL

## Production Deployment

1. **Security**
   - Change `JWT_SECRET` to a strong random string
   - Use environment variables for all secrets
   - Enable HTTPS
   - Set up proper CORS origins

2. **Database**
   - Use production MySQL credentials
   - Enable SSL for database connections
   - Set up database backups

3. **Email**
   - Use production SMTP service (SendGrid, AWS SES, etc.)
   - Set up email templates
   - Monitor email delivery

