# SmartSeva Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up your MySQL database:
```sql
CREATE DATABASE IF NOT EXISTS citizens;
USE citizens;

CREATE TABLE IF NOT EXISTS Citizen (
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

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your MySQL credentials

4. Start the server:
```bash
npm start
```

## Available Endpoints

### Public Routes
- POST `/api/citizens/register` - Register a new citizen
- POST `/api/citizens/login` - Login with email/password

### Protected Routes (requires JWT token)
- GET `/api/citizens/profile` - Get logged-in citizen's profile

### Health Check
- GET `/health` - Check if the server is running

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL user | root |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | Database name | citizens |
| DB_PORT | MySQL port | 3306 |
| JWT_SECRET | Secret for JWT tokens | - |

## Development

Test the API:
1. Health check: http://localhost:5000/health
2. Register a citizen: POST http://localhost:5000/api/citizens/register
3. Login: POST http://localhost:5000/api/citizens/login