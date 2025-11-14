# SmartSeva Frontend - Complete User Guide

## Overview
The SmartSeva frontend is now complete with all pages for users to:
- Browse and apply for services
- Track applications
- Upload documents
- Make payments for bills (electricity, gas, water)
- Create and track grievances

## Pages Overview

### 1. **Dashboard** (`/dashboard`)
- User profile information
- Quick action buttons
- Department selection to browse services
- Navigation to all other pages

### 2. **Services Page** (`/services`)
- View all available services
- Filter services by department
- Apply for services
- View service details (fee, processing time, description)

**Features:**
- Department filter dropdown
- Service cards with detailed information
- Apply button for each service
- Modal confirmation before applying

### 3. **Applications Page** (`/applications`)
- View all user applications
- Track application status (Pending, In Progress, Completed, Rejected)
- Make payments for pending applications
- Upload required documents

**Features:**
- Payment modal with multiple payment options (UPI, Credit Card, Debit Card, Net Banking, Wallet)
- Document upload modal with file selection
- Status badges with color coding
- Transaction ID display after payment

### 4. **Grievances Page** (`/grievances`)
- View all submitted grievances
- Create new grievances
- Track grievance status (Open, In Progress, Resolved)
- View resolution remarks from admin

**Features:**
- Create grievance modal with service selection (optional)
- Description text area
- Status tracking with color-coded badges
- Resolution box showing admin response

### 5. **Admin Dashboard** (`/admin`)
- Admin-only access
- View all applications
- Update application status (send email notifications on completion)
- Verify/reject documents
- Resolve grievances

## Navigation Flow

```
Home → Login/Register → Dashboard
                          ↓
              ┌───────────┼───────────┐
              ↓           ↓           ↓
          Services   Applications  Grievances
              ↓           ↓
         Apply for    Pay & Upload
         Services     Documents
```

## User Journey Examples

### Example 1: Paying Electricity Bill
1. Login → Dashboard
2. Click "Services" or select "Electricity Department" from dropdown
3. Browse services → Select "Electricity Bill Payment"
4. Click "Apply Now" → Confirm application
5. Go to "My Applications"
6. Click "Pay Now" on the pending application
7. Enter amount, select payment mode (UPI/Card/NetBanking)
8. Complete payment → Get transaction ID

### Example 2: Applying for New Water Connection
1. Login → Dashboard → Services
2. Filter by "Water Supply Department"
3. Select "New Water Connection" service
4. Apply for service
5. Go to "My Applications"
6. Upload required documents (Property Proof, etc.)
7. Make payment
8. Track status until completion

### Example 3: Creating a Grievance
1. Login → Dashboard → Grievances
2. Click "Create New Grievance"
3. Select service (optional)
4. Enter detailed description
5. Submit grievance
6. Track status and view admin resolution

## Payment Options

Users can make payments using:
- **UPI** (Recommended)
- **Credit Card**
- **Debit Card**
- **Net Banking**
- **Wallet**

Payment integration:
- Mock payment system (for development)
- Transaction ID generation
- Payment status tracking
- Application status update after payment

## Document Upload

Supported file types:
- PDF
- JPG/JPEG
- PNG

Document types available:
- Aadhaar Card
- Address Proof
- Identity Proof
- Property Proof
- Old Bill
- Certificate
- Other

## Features Implemented

### ✅ Complete Features
- [x] User authentication (Login/Register)
- [x] Dashboard with profile and quick actions
- [x] Services browsing and filtering
- [x] Service application
- [x] Application tracking
- [x] Document upload
- [x] Payment processing (mock)
- [x] Grievance creation and tracking
- [x] Admin dashboard
- [x] Email notifications (backend)
- [x] Responsive design
- [x] Navigation between all pages

### Payment Flow
1. User applies for service
2. Application created with status "PENDING"
3. User navigates to Applications page
4. User clicks "Pay Now" on pending application
5. Payment modal opens
6. User enters amount and selects payment mode
7. Payment processed → Transaction ID generated
8. Application status updated to "IN_PROGRESS"

### Document Upload Flow
1. User applies for service
2. User goes to Applications page
3. User clicks "Upload Document" on application
4. Document upload modal opens
5. User selects document type and file
6. File uploaded → Document ID generated
7. Document status: "PENDING" (awaiting admin verification)

### Grievance Flow
1. User creates grievance with service (optional) and description
2. Grievance created with status "OPEN"
3. Admin reviews and resolves grievance
4. User views resolution remark on Grievances page

## API Endpoints Used

### Public
- `POST /api/citizens/register`
- `POST /api/citizens/login`

### Protected (Citizen)
- `GET /api/citizens/profile`
- `GET /api/departments`
- `GET /api/services`
- `GET /api/applications`
- `POST /api/applications`
- `POST /api/applications/:appId/documents`
- `POST /api/applications/:appId/pay`
- `GET /api/grievances`
- `POST /api/grievances`

### Admin
- `GET /api/admin/profile`
- `GET /api/admin/dashboard`
- `GET /api/admin/applications`
- `PUT /api/admin/applications/:appId/status`
- `GET /api/admin/pending-documents`
- `PUT /api/admin/documents/:docId/verify`
- `GET /api/admin/grievances`
- `PUT /api/admin/grievances/:grievanceId/resolve`

## Testing the Application

1. **Register a new user**:
   - Go to `/register`
   - Fill in details
   - Register

2. **Login**:
   - Go to `/login`
   - Enter email and password
   - Login

3. **Browse Services**:
   - Go to Dashboard
   - Click "Services" or select department
   - View available services

4. **Apply for Service**:
   - Select a service
   - Click "Apply Now"
   - Confirm application

5. **Make Payment**:
   - Go to "My Applications"
   - Click "Pay Now" on pending application
   - Enter payment details
   - Complete payment

6. **Upload Document**:
   - Go to "My Applications"
   - Click "Upload Document"
   - Select document type and file
   - Upload

7. **Create Grievance**:
   - Go to "Grievances"
   - Click "Create New Grievance"
   - Fill in details
   - Submit

## Responsive Design

All pages are responsive and work on:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- All payment processing is mock (for development)
- Email notifications require SMTP configuration in backend
- File uploads are stored in `backend/uploads/` directory
- Authentication tokens are stored in localStorage

## Future Enhancements

- Real payment gateway integration
- Push notifications
- SMS notifications
- Document preview
- Application history
- Download receipts/invoices
- Multi-language support
- Dark mode

