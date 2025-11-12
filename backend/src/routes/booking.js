import express from "express";
import { citizenOnly, protectRoute } from "../middleware/protectRoute.js";
import { bookbus, bookedseats, getAllBuses, getAllfuturebook, getAllPastBook } from "../controllers/booking.js";

const router = express.Router();

router.post("/allBusSrc_dst", protectRoute, getAllBuses);
router.post("/bookbus/:bus_id",protectRoute,citizenOnly,bookbus);
router.get("/bookedbus",protectRoute,citizenOnly,getAllPastBook);
router.get("/bookbus",protectRoute,citizenOnly,getAllfuturebook);
router.post("/bookedseats/:bus_id",protectRoute,bookedseats);


export default router;