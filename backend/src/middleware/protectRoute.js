import jwt from 'jsonwebtoken';
import { connectDb } from '../lib/db.js';

export const protectRoute = async(req, res, next) => {
    try {
        const token=req.cookies.jwt;
        if(!token){
            return res.status(401).json({message:"Unauthorized - No token provided"});
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message:"Unauthorized - Invalid token"});
        }
        req.user={id:decoded.userId,role:decoded.role};

        
        const conn=await connectDb();
        if (decoded.role === "citizen") {
            const [rows] = await conn
                .promise()
                .query("SELECT * FROM citizen WHERE citizen_id = ?", [decoded.userId]);
            if (rows.length === 0)
                return res.status(401).json({ message: "Unauthorized - User not found" });
            req.user = rows[0];
            req.user.role="citizen";
        }
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware:", error);
        return res.status(500).json({message:"Internal Server Error"});
    }
};

export const adminOnly = async (req, res, next) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied. Admins only." });

    const conn = await connectDb();
    const [rows] = await conn
      .promise()
      .query("SELECT * FROM admin WHERE admin_id = ?", [req.user.id]);
    if (rows.length === 0)
      return res.status(401).json({ message: "Unauthorized - Admin not found" });

    req.user= rows[0];
    req.user.role="admin";
    next();
  } catch (error) {
    console.log("Error in adminOnly middleware:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const citizenOnly = async (req, res, next) => {
  try {
    if (req.user.role !== "citizen")
      return res.status(403).json({ message: "Access denied. Citizens only." });

    const conn = await connectDb();
    const [rows] = await conn
      .promise()
      .query("SELECT * FROM citizen WHERE citizen_id = ?", [req.user.citizen_id]);
    if (rows.length === 0)
      return res.status(401).json({ message: "Unauthorized - citizen not found" });

    req.user= rows[0];
    req.user.role="citizen";
    next();
  } catch (error) {
    console.log("Error in citizenOnly middleware:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};