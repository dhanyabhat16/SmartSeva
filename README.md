# SmartSeva - Smart Citizen Services Portal

## 📋 Project Overview

**SmartSeva** is a comprehensive digital platform designed to streamline citizen-government interactions by providing online access to essential municipal services. The platform enables citizens to apply for various services, track applications, make payments, and raise grievances across multiple government departments.

### Purpose

SmartSeva aims to:
- Eliminate the need for physical visits to government offices
- Reduce processing time for citizen applications
- Provide transparent tracking of application status
- Enable secure online payments
- Facilitate quick resolution of citizen grievances
- Improve efficiency of government service delivery

### Key Features

- **Multi-Department Services**: Electricity, Gas Supply, Water Supply, and Transportation services
- **Citizen Portal**: User registration, login, and personalized dashboard
- **Application Management**: Apply for services, upload documents, and track status
- **Payment Gateway**: Secure online payment processing
- **Grievance System**: Submit and track grievances with automated resolution
- **Admin Panel**: Department-wise admin access for application processing
- **Document Verification**: Automated document verification workflow
- **Real-time Notifications**: Status updates and completion alerts

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: React.js 18.3.1
- **Routing**: React Router DOM v6
- **Styling**: Custom CSS with modern animations
- **HTTP Client**: Fetch API
- **State Management**: React Hooks (useState, useEffect, useNavigate)

### Backend
- **Runtime**: Node.js 20.18.0
- **Framework**: Express.js 4.18.2
- **Database**: MySQL 8.0+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Security**: 
  - CORS enabled
  - Helmet for HTTP headers
  - Environment variables (.env)

### Database
- **RDBMS**: MySQL
- **Features Used**:
  - Triggers (auto-update age, completion dates)
  - Stored Procedures (dashboard stats, application details)
  - Functions (calculate processing time, admin checks)
  - Foreign Key Constraints
  - ENUMs for status tracking

---

## 📁 Project Structure

```
SmartSeva/
├── frontend/                  # React frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── pages/           # Page components
│   │   │   ├── Home.js      # Landing page
│   │   │   ├── Home.css
│   │   │   ├── Register.js  # Citizen registration
│   │   │   ├── Register.css
│   │   │   ├── Login.js     # Authentication
│   │   │   ├── Login.css
│   │   │   ├── Dashboard.js # Citizen dashboard
│   │   │   └── Dashboard.css
│   │   ├── App.js           # Main app with routing
│   │   └── index.js         # React entry point
│   └── package.json
│
├── backend/                  # Express backend API
│   ├── routes/
│   │   └── citizens.js      # Citizen & auth routes
│   ├── config/
│   │   └── db.js            # MySQL connection pool
│   ├── index.js             # Express server
│   ├── database.sql         # Complete DB schema with triggers/procedures
│   ├── .env.example         # Environment template
│   └── package.json
│
├── PROJECT_REPORT.md        # Detailed project documentation
└── README.md                # This file
```

---

## 🗄️ Database Schema

### Core Tables

#### 1. **Citizen** (Users)
```sql
citizen_id, name, dob, gender, age, phone, email, aadhaar, address, pin, password
```
- Primary user table with authentication credentials
- Auto-calculates age from DOB using triggers
- Unique constraints on email and Aadhaar

#### 2. **Department**
```sql
dept_id, dept_name, contact_email, contact_phone
```
Sample Departments:
- Electricity Department
- Gas Supply Department  
- In-City Bus Booking Department
- Water Supply Department

#### 3. **Service**
```sql
service_id, service_name, description, dept_id, fee, processing_days
```
- Links services to departments
- Defines processing time and fees

#### 4. **Application**
```sql
app_id, citizen_id, service_id, applied_date, completion_date, status, remark
```
Status Flow: `PENDING` → `DOCUMENTS_VERIFIED` → `IN_PROGRESS` → `COMPLETED` / `REJECTED`

#### 5. **Document**
```sql
doc_id, app_id, doc_type, doc_path, uploaded_date, verification_status
```
Verification Status: `PENDING` → `VERIFIED` / `REJECTED`

#### 6. **Payment**
```sql
payment_id, app_id, amount, payment_date, payment_mode, transaction_id, status
```
Payment Modes: UPI, Credit Card, Debit Card, NetBanking

#### 7. **Grievance**
```sql
grievance_id, citizen_id, service_id, description, status, created_date, resolved_date
```
Status: `OPEN` → `IN_PROGRESS` → `RESOLVED` / `CLOSED`

#### 8. **Admin**
```sql
admin_id, citizen_id, dept_id, role
```
Roles: `SUPER_ADMIN` (all departments), `DEPT_ADMIN` (specific department)

### Database Features

**Triggers:**
- `calculate_age_on_insert/update` - Auto-calculates age from DOB
- `update_completion_date` - Sets completion date when status = COMPLETED
- `validate_dob_before_insert` - Prevents invalid DOB entries

**Stored Procedures:**
- `GetApplicationDetails(appId)` - Fetch complete application info
- `UpdateApplicationStatus(appId, status, remark)` - Update with email notification flag
- `GetApplicationsByDepartment(deptId)` - Department-wise filtering
- `GetDashboardStats(deptId)` - Real-time statistics
- `GetCitizenApplications(citizenId)` - User's application history

**Functions:**
- `GetTotalApplications(citizenId)` - Count user applications
- `GetAvgProcessingTime(serviceId)` - Calculate average processing days
- `IsAdmin(citizenId)` - Check admin privileges

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### 1. Clone Repository
```powershell
git clone https://github.com/yourusername/SmartSeva.git
cd SmartSeva
```

### 2. Database Setup
```powershell
# Open MySQL Workbench or command line
mysql -u root -p

# Run the database script
source backend/database.sql
```

Or in MySQL Workbench:
- Open `backend/database.sql`
- Execute the entire script (Ctrl+Shift+Enter)

This will:
- Create `citizens` database
- Create all tables with relationships
- Insert sample data (5 citizens, 4 departments, 5 services)
- Create triggers, functions, and stored procedures

### 3. Backend Setup
```powershell
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env with your MySQL credentials
notepad .env
```

**.env Configuration:**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=citizens
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Start Backend:**
```powershell
npm start
```

Server will run on: `http://localhost:5000`

### 4. Frontend Setup
```powershell
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run on: `http://localhost:3000`

---

## 🔌 API Endpoints

### Base URL: `http://localhost:5000/api`

#### Authentication & Citizen Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/citizens/register` | Register new citizen | No |
| POST | `/citizens/signin` | Login citizen | No |
| GET | `/citizens/profile` | Get citizen profile | Yes (JWT) |

#### Request/Response Examples

**Register Citizen:**
```json
POST /api/citizens/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "phone": "9876543210",
  "aadhaar": "123456789012",
  "dob": "1990-05-15",
  "gender": "Male",
  "address": "123 Main Street, City",
  "pin": "560001"
}

Response: 201 Created
{
  "success": true,
  "message": "Registration successful",
  "citizenId": 6
}
```

**Login:**
```json
POST /api/citizens/signin
{
  "email": "john@example.com",
  "password": "secure123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "citizen": {
    "citizen_id": 6,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Get Profile:**
```json
GET /api/citizens/profile
Headers: { "Authorization": "Bearer <token>" }

Response: 200 OK
{
  "success": true,
  "citizen": {
    "citizen_id": 6,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "age": 35
  }
}
```

---

## 🧪 Testing the Application

### 1. Manual Testing Flow

**Step 1: Register a New Citizen**
- Navigate to `http://localhost:3000`
- Click "Register Now"
- Fill the registration form
- Submit and verify success message

**Step 2: Login**
- Click "← Home" and then "Sign In"
- Enter registered email and password
- Should redirect to dashboard

**Step 3: Dashboard (Planned - In Development)**
- View available departments
- Browse services by department
- Apply for a service
- Upload required documents
- Track application status
- Raise grievances if needed

### 2. API Testing with cURL

**Health Check:**
```powershell
curl http://localhost:5000/health
```

**Register:**
```powershell
curl -X POST http://localhost:5000/api/citizens/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@test.com\",\"password\":\"test123\",\"phone\":\"9999999999\",\"aadhaar\":\"999999999999\"}'
```

**Login:**
```powershell
curl -X POST http://localhost:5000/api/citizens/signin `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@test.com\",\"password\":\"test123\"}'
```

### 3. Database Verification

```sql
-- Check registered citizens
SELECT citizen_id, name, email, phone FROM Citizen;

-- Check applications
SELECT a.app_id, c.name, s.service_name, a.status 
FROM Application a
JOIN Citizen c ON a.citizen_id = c.citizen_id
JOIN Service s ON a.service_id = s.service_id;

-- Check grievances
SELECT g.grievance_id, c.name, g.description, g.status
FROM Grievance g
JOIN Citizen c ON g.citizen_id = c.citizen_id;
```

---

## 🔐 Security Features

1. **Password Security**
   - Passwords hashed using bcryptjs (10 rounds)
   - Never stored in plain text

2. **JWT Authentication**
   - Token-based authentication
   - Tokens expire after configured time
   - Stateless authentication

3. **SQL Injection Prevention**
   - Parameterized queries used throughout
   - Input validation on backend

4. **CORS Configuration**
   - Configured for frontend origin
   - Prevents unauthorized access

5. **Environment Variables**
   - Sensitive data in .env (not committed to Git)
   - Different configs for dev/production

---

## 🐛 Troubleshooting

### Common Issues

**1. Backend won't start - "Cannot find module"**
```powershell
cd backend
rm -r -force node_modules
rm -force package-lock.json
npm install
```

**2. Database connection error**
- Check MySQL is running
- Verify credentials in `.env`
- Ensure `citizens` database exists

**3. Frontend blank page / errors**
- Check browser console (F12)
- Verify backend is running on port 5000
- Clear browser cache

**4. "Email already exists" during registration**
- Email must be unique
- Use a different email or check existing records

**5. Login fails with correct credentials**
- Check if password was hashed during registration
- Verify JWT_SECRET is set in backend `.env`

### Debug Commands

**Check MySQL connection:**
```powershell
mysql -u root -p -e "USE citizens; SHOW TABLES;"
```

**Check backend logs:**
```powershell
cd backend
npm start
# Watch console for errors
```

**Check frontend build:**
```powershell
cd frontend
npm run build
```

---

## 📊 Sample Data

The database comes pre-populated with:
- 5 Citizens (Amit, Priya, Ravi, Sneha, Arun)
- 4 Departments (Electricity, Gas, Bus, Water)
- 5 Services across departments
- 5 Applications in various states
- 5 Grievances (some resolved, some open)
- 5 Admin accounts

**Sample Login Credentials:**
```
Email: amit.kumar@gmail.com
Password: (Run SELECT password FROM Citizen WHERE email='amit.kumar@gmail.com')
Note: Passwords are hashed. For testing, register a new user.
```

---

## 🚧 Current Status & Roadmap

### ✅ Completed Features
- Frontend pages: Home, Register, Login, Dashboard (UI)
- Backend API: Register, Login, Profile
- Database schema with triggers/procedures
- JWT authentication
- Password hashing
- MySQL connection pooling

### 🔄 In Progress
- Dashboard functionality (services, applications, grievances)
- File upload for documents
- Payment gateway integration

### 📋 Planned Features
- Admin panel for department officers
- Email notifications
- SMS alerts
- Document verification workflow
- Payment history
- Grievance tracking
- Analytics dashboard
- Mobile responsive UI
- Multi-language support

---

## 👥 Team & Contribution

### Contributors
- [Your Name] - Full Stack Development

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues, questions, or contributions:
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/SmartSeva/issues)
- **Documentation**: See `PROJECT_REPORT.md` for detailed technical documentation

---

**Last Updated**: November 18, 2025  
**Version**: 1.0.0  
**Status**: Active Development
