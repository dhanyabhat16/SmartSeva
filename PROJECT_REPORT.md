# SmartSeva — Project Report

Date: 2025-11-18

## 1) Executive Summary
SmartSeva is a simple citizen services portal with a React frontend and an Express + MySQL backend. Citizens can register and log in, then access a dashboard. The backend persists citizens in a MySQL database and provides authentication using JWT. The UI includes a modern home page, registration form with validation, and a login flow that redirects to a protected dashboard.

## 1.1) Purpose of the Project
The purpose of SmartSeva is to provide citizens with a unified, digital gateway to interact with multiple government departments and essential utilities. Instead of visiting separate portals or offices for electricity, gas, water, or transport services, SmartSeva consolidates account creation, authentication, and service access into a single, user-friendly interface. The platform aims to reduce friction, increase transparency, and shorten turnaround times for common citizen services.

By centralizing authentication and enabling secure, auditable interactions, SmartSeva supports modernization initiatives such as digital service delivery, streamlined grievance redressal, and standardized communication between citizens and departments. Over time, it can expand to support e-payments, document verification workflows, and real-time application tracking across departments.

## 1.2) Scope of the Project
In the current scope, SmartSeva implements citizen registration and login using a secure backend and a MySQL database, along with a dashboard to access personal information. A modern home page drives users towards registration or login. The backend exposes well-defined REST endpoints for registration, authentication, and profile retrieval.

The extended scope (planned) includes department and service catalogs, application submission and tracking, document management (upload/verification), payments with reconciliation, and grievance registration and resolution. The database schema provided in the brief covers these modules (Department, Service, Application, Document, Payment, Grievance, Admin), and the frontend will progressively incorporate department-wise service discovery and grievance filing from the dashboard.

## 2) Detailed Description
SmartSeva follows a simple, modular architecture.

- Frontend (React + React Router):
  - Landing page with a hero section and scroll-reveal content to explain the value proposition.
  - Registration page with client-side validation mapped to the `Citizen` table: name, DOB, gender, age, phone, email, Aadhaar, address, PIN, password.
  - Login page that posts credentials to the backend, receives a JWT token, saves it locally, and redirects to a protected dashboard.
  - Dashboard (protected route) that reads the JWT, fetches citizen profile, and serves as a starting point for department-wise services and grievances (to be expanded).

- Backend (Express + MySQL):
  - `/api/citizens/register`: Validates input, ensures uniqueness on Aadhaar/email, hashes password with bcrypt, and inserts into `Citizen`.
  - `/api/citizens/login`: Verifies credentials and returns a signed JWT (24-hour expiry).
  - `/api/citizens/profile`: JWT-protected; returns citizen profile fields for the dashboard.
  - The backend uses a shared MySQL connection pool (`mysql2/promise`) and environment-based configuration via `.env`.

- Data Model (Current and Planned):
  - Current implementation uses the `Citizen` table for identity and authentication.
  - Planned modules leverage provided schema: `Department`, `Service`, `Application`, `Document`, `Payment`, `Grievance`, and `Admin`. These enable department-wise service discovery, application lifecycle tracking, document verification, payment status, and grievance workflows.

User Journeys:
1) Registration: The user completes the form → frontend validates → backend hashes password and creates the record → user is notified of success.
2) Login: The user submits email/password → backend issues JWT → frontend stores token → user is redirected to the dashboard.
3) Dashboard (current): Displays user profile and serves as the hub for future department/service/grievance features.

Security Considerations:
- Passwords are hashed (bcrypt) before storage.
- JWT-based auth protects private routes.
- Recommended production practices include HTTPS, stricter validation, rate-limiting, and secure secret management.

## 3) Functional Requirements
- Citizen Registration:
  - The system shall allow a citizen to create an account with fields: name, dob, gender, age, phone, email, Aadhaar, address, pin, password.
  - The system shall validate Aadhaar (12 digits), phone (10 digits), and PIN (6 digits) on the client and server.
  - The system shall ensure Aadhaar and/or email uniqueness and respond with an error if duplicates exist.

- Citizen Login & Authentication:
  - The system shall allow a citizen to authenticate using email and password.
  - The system shall verify the password (hashed comparison) and return a JWT token upon success.
  - The system shall reject invalid credentials with a clear error response.

- Protected Dashboard Access:
  - The system shall restrict access to the dashboard to authenticated citizens with a valid JWT.
  - The system shall fetch and display the citizen’s profile (name, email, phone, address, pin) on the dashboard.

- Home/Landing Experience:
  - The system shall present a modern homepage with a prominent hero section, CTAs to Register and Login, and informational content sections that reveal on scroll.

- Department and Services (Planned Next):
  - The system shall provide an endpoint to list departments and, for each department, the services it offers.
  - The dashboard shall allow citizens to choose a department and view/filter services by department.

- Applications (Planned Next):
  - The system shall allow citizens to submit applications for services and track their status (pending, in progress, completed) with timestamps.

- Documents (Planned Next):
  - The system shall allow uploading required documents per application and maintain verification status (pending, verified, rejected).

- Payments (Planned Next):
  - The system shall support recording of payments with mode, transaction id, and status (pending, success, failed).

- Grievances (Planned Next):
  - The system shall allow citizens to raise grievances linked to services, track their status, and view resolution notes and dates.

## 2) Tech Stack
- Frontend: React (CRA), React Router
- Backend: Node.js, Express, JWT (jsonwebtoken), bcryptjs, mysql2
- Database: MySQL (Workbench/Server)
- Tooling: dotenv for configuration, CORS enabled for local development

## 3) Repository Structure
- `frontend/`
  - `src/pages/Home.js`, `Home.css`: Modern landing page with hero image, scroll-reveal sections
  - `src/pages/Register.js`, `Register.css`: Registration form mapping to the Citizen table with client-side validation
  - `src/pages/Login.js`, `Login.css`: Login form posting to backend, stores JWT token
  - `src/pages/Dashboard.js`, `Dashboard.css`: Basic dashboard scaffold, loads profile; planned to show department services and grievances
  - `src/App.js`: Routes (`/`, `/register`, `/login`, `/dashboard`)
- `backend/`
  - `index.js`: Express server bootstrap, mounts routes
  - `db.js`: MySQL connection pool using mysql2/promise
  - `routes/citizens.js`: Registration, login, and profile endpoints
  - `middleware/auth.js`: JWT verification middleware
  - `.env.example`: Template configuration
  - `package.json`: Backend dependencies and scripts
  - `README.md`: Backend setup, SQL schema, and run instructions

## 4) Frontend Details
- Routes
  - `/` Home: Hero, CTAs for Register and Login, informational sections with reveal on scroll
  - `/register` Register: Fields mapped to DB columns, client validation (Aadhaar 12 digits, PIN 6 digits, phone 10 digits)
  - `/login` Login: Email + password, POST to backend, stores token, redirects to `/dashboard`
  - `/dashboard` Dashboard: Reads token, fetches profile; planned to filter services/grievances by department
- Validation & UX
  - Register: Required fields (name, email, password), length checks, basic digit patterns
  - Loading states and basic alerts for error/success
  - Top-left back buttons on Register/Login for quick navigation
- Dependencies
  - React, react-router-dom

## 5) Backend Details
- Express server (`backend/index.js`)
  - CORS + JSON middleware
  - Routes under `/api/citizens`
  - Health check: `GET /health`
- Database connection (`backend/db.js`)
  - Reads credentials from `.env`, creates a mysql2/promise pool
  - Logs connection success/failure
- Citizens routes (`backend/routes/citizens.js`)
  - `POST /api/citizens/register`
    - Validates inputs (name/email/password required; aadhaar/phone/pin formats)
    - Checks duplicate Aadhaar or email
    - Hashes password (bcryptjs) and inserts into `Citizen`
    - Response: `{ success: true, id }`
  - `POST /api/citizens/login`
    - Validates credentials
    - Compares hashed password
    - Issues JWT token with 24h expiry: `{ token }`
  - `GET /api/citizens/profile` (protected)
    - Validates JWT, returns citizen profile fields
- Auth middleware (`backend/middleware/auth.js`)
  - Extracts bearer token, verifies JWT with `JWT_SECRET`

## 6) Database Schema (Current)
Core table used now:

```sql
CREATE TABLE Citizen (
  citizen_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  dob DATE,
  gender VARCHAR(10),
  age INT,
  phone VARCHAR(15),
  email VARCHAR(100),
  aadhaar VARCHAR(20) UNIQUE,
  address TEXT,
  pin VARCHAR(10),
  password VARCHAR(255)
);
```

Extended schema provided (planned/next): Department, Service, Application, Document, Payment, Grievance, Admin with relevant FKs and additional status columns. See `backend/README.md` for full SQL.

## 7) API Summary
- Public
  - `POST /api/citizens/register`
    - Body: `{ name, dob, gender, age, phone, email, aadhaar, address, pin, password }`
    - Returns: `{ success: true, id }`
  - `POST /api/citizens/login`
    - Body: `{ email, password }`
    - Returns: `{ token }`
- Protected (Authorization: `Bearer <token>`)
  - `GET /api/citizens/profile`
    - Returns: `{ citizen_id, name, email, phone, address, pin }`
- Proposed (not yet implemented)
  - `GET /api/departments`
  - `GET /api/departments/:deptId/services`
  - `GET /api/citizens/applications`
  - `GET /api/citizens/grievances`

## 8) Setup & Run
- Backend
  1) Create `.env` from `.env.example` and set DB credentials and `JWT_SECRET`
  2) Ensure MySQL is running and the `citizens` DB + `Citizen` table exist
  3) Install deps and run server

  ```powershell
  cd backend
  npm install
  npm start
  # Health check
  curl http://localhost:5000/health
  ```

- Frontend
  ```powershell
  cd frontend
  npm install
  npm start
  # Open http://localhost:3000
  ```

- Test flows
  - Registration: `/register` → creates a row in `Citizen`
  - Login: `/login` → receives token → redirected to `/dashboard`
  - Dashboard: fetches profile using token; will later show departments, services, grievances

## 9) Security Notes
- Passwords hashed with bcryptjs before storing
- JWT used for session; store token in `localStorage` (simple dev approach)
- For production: use HTTPS, secure cookies or storage, rate limiting, input validation server-side, and detailed audit logs

## 10) Known Gaps / Next Steps
- Implement Department/Service/Grievance endpoints to support dashboard filters
  - `GET /api/departments`
  - `GET /api/departments/:deptId/services`
  - `GET /api/citizens/applications`
  - `GET /api/citizens/grievances`
- Add role-based access (Admin/Department Admin) endpoints
- Migrate client alerts to inline form messages and toast notifications
- Add E2E tests and unit tests
- Add file upload for `Document` with storage (S3/local) and verification workflow
- Payments integration flow and status reconciliation for `Payment`

## 11) Troubleshooting
- If `npm start` in backend fails with missing modules: delete `node_modules` and `package-lock.json`, then `npm install`
- If DB connection fails: verify `.env` credentials and that DB/tables exist; confirm MySQL listening on `DB_PORT`
- CORS errors: ensure backend runs on 5000 with CORS enabled, frontend on 3000

---
This report covers current implementation and outlines planned features informed by the extended schema you provided.