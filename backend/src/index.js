import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";

import { connectDb } from './lib/db.js';
import authRoutes from './routes/auth.js';
import cookieParser from  'cookie-parser';
import bookBusRoutes from './routes/bookbus.js';
import adminRoutes from './routes/admin.js';
import bookingRoutes from './routes/booking.js'

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}));

app.use("/api/auth",authRoutes);
app.use("/api/admin",adminRoutes)
app.use("/api/bookbus",bookBusRoutes);
app.use("/api/booking",bookingRoutes);
app.listen(PORT, () => {
    connectDb();
  console.log(`Server is running on http://localhost:${PORT}`);
});