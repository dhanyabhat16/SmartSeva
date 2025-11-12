# Bus Booking System

A full-featured **Bus Booking System** built using the **SERN stack** (**MySQL**, **Express.js**, **React.js**, **Node.js**) with **Zustand** for state management. This project provides a complete **admin** and **user** interface to manage buses, routes, stops, bookings, and payments.
---

## Features

### **Admin Features**
- **Authentication & Profile**
  - Login, logout
  - Fetch and update admin profile
- **Admin Management**
  - Add new admins
  - View all admins
- **Route Management**
  - Add, delete, and view all routes
  - Manage route variants (add/edit/delete)
- **Bus Management**
  - Add, delete, and view all buses
  - Manage bus schedules (add/edit/delete)
  - Assign buses to specific routes
- **Stop Management**
  - Add, edit, delete, and view all stops
- **Payments & Earnings**
  - Fetch payment history
  - Track earnings for selected periods

### **User Features**
- **Authentication & Profile**
  - Signup, login, logout
  - Update profile information
- **Bus Booking**
  - Browse buses between selected source and destination
  - View available seats and book them
  - Fetch upcoming and past bookings
- **Travel Management**
  - Select source, destination, date, and bus
  - View booked seats
  - Track amount paid for bookings

---

## Tech Stack

- **Frontend:** React.js , TailwindCSS , DaisyUI 
- **State Management:** Zustand  
- **API Requests:** Axios  
- **Notifications:** React Hot Toast  
- **Backend:** Node.js, Express.js  
- **Database:** MySQL 

---


## Installation & Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd <project-folder>
```

2. Set up backend:

```bash
cd backend
npm install
nodemon src/index.js
```

3. Set up frontend (in new terminal) :

```bash
cd frontend
npm install
npm run dev
```






