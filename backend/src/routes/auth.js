import express from 'express';
import { adminUpdateProfile, checkuser, getProfile, login, logout, signup, updateProfile } from '../controllers/auth.js';
import { adminOnly, protectRoute } from '../middleware/protectRoute.js';

const router=express.Router();
router.post("/signup",signup);

router.post("/login",login);

router.post("/logout",protectRoute,logout);

router.get("/profile",protectRoute,getProfile);

router.put("/updateProfile",protectRoute,updateProfile);

router.put("/admin-updateProfile",protectRoute,adminOnly,adminUpdateProfile);

router.get("/checkuser",protectRoute,checkuser)

export default router;