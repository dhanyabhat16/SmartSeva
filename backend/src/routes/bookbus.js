import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getAllBus, getAllRouteBuses, getAllRoutes, getAllRouteVariants } from '../controllers/bookbus.js';

const router=express.Router();
router.get("/getAllRoutes",protectRoute,getAllRoutes);
router.get("/getAllRouteVariants/:route_id",protectRoute,getAllRouteVariants);
router.get("/getAllBus",protectRoute,getAllBus);
router.get("/allrouteBus/:route_id",protectRoute,getAllRouteBuses);

                                                                                    
export default router;