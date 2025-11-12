import express from "express";
import { adminOnly, protectRoute } from "../middleware/protectRoute.js";
import { addAdmins, addBusSchedule, addRouteVariant, allRoute, createBus, createRoute, createStops, deleteBus, deleteBusSchedule, deleteRoute, deleteRouteVariant, deleteStops, editBusSchedule, editRouteVariant, editStops, getAllAdmins, getAllStops, getPayHistory } from "../controllers/admin.js";
const router = express.Router();

router.post("/addAdmin",protectRoute,adminOnly,addAdmins);
router.get("/getAllAdmins",protectRoute,adminOnly,getAllAdmins);

router.post("/createRoute",protectRoute,adminOnly,createRoute);
router.delete("/deleteRoute/:id",protectRoute,adminOnly,deleteRoute);

router.post("/createBus",protectRoute,adminOnly,createBus);
router.delete("/deleteBus/:id",protectRoute,adminOnly,deleteBus);

router.post("/createStops",protectRoute,adminOnly,createStops);
router.put("/editStops/:id",protectRoute,adminOnly,editStops);
router.delete("/deleteStops/:id",protectRoute,adminOnly,deleteStops);
router.get("/getAllStops",protectRoute,getAllStops);

router.post("/addRouteStops/:route_id",protectRoute,adminOnly,addRouteVariant);
router.put("/editRouteVariant/:route_id/:variant_id",protectRoute,adminOnly,editRouteVariant);
router.delete("/deleteRouteVariant/:route_id/:variant_id",protectRoute,adminOnly,deleteRouteVariant);

router.post("/addBusSchedule/:bus_id",protectRoute,adminOnly,addBusSchedule);
router.put("/editBusSchedule/:bus_id",protectRoute,adminOnly,editBusSchedule);
router.delete("/deleteBusSchedule/:bus_id",protectRoute,adminOnly,deleteBusSchedule);

router.post("/payments",protectRoute,adminOnly,getPayHistory);

export default router;