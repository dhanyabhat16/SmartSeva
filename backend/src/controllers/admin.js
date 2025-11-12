import { connectDb } from "../lib/db.js";
import bcrypt from "bcryptjs";

export const addAdmins=async(req,res)=>{
    const {username,password,full_name}=req.body;
    if(!username || !password || !full_name){
        return res.status(400).json({message:"All fields are required"});
    }
    try {
        if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters long"});
        }
        const conn=await connectDb();
        const [existingAdmins]=await conn.promise().query("Select * from admin where username=?",[username]);
        if(existingAdmins.length>0){
            return res.status(400).json({message:"Username already exists"});
        }
        const salt=bcrypt.genSaltSync(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        const newAdmin=[username,hashedPassword,full_name];
        await conn.promise().query("Insert into admin (username,password,full_name) values (?,?,?)",newAdmin);
        return res.status(201).json({message:"Admin added successfully"});
    } catch (error) {
        if (error.code === "ER_SIGNAL_EXCEPTION" && error.sqlMessage.includes("citizen")) {
        return res.status(400).json({ message: "Username already exists" });
        }
        console.error("Error adding admin:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};2

export const getAllAdmins=async(req,res)=>{
    try{
        const conn=await connectDb();
        const [admins]=await conn.promise().query("Select full_name,username from admin where admin_id!=?",[req.user.admin_id]);
        return res.status(200).json(admins);
    }catch(error){
        console.error("Error fetching admins:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const createRoute=async(req,res)=>{
    let {route_name}=req.body;
    route_name=route_name?.trim();
    route_name=route_name?.toLowerCase();
    if(!route_name){
        return res.status(400).json({message:"Route name is required"});
    }
    try {
        const conn=await connectDb();
        await conn.promise().query("Insert into routes (route_name) values (?)",[route_name]);
        return res.status(201).json({message:"Route created successfully"});
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY" && error.sqlMessage.includes("route_name")) {
        return res.status(400).json({ message: "Route name already exists" });
        }
        console.error("Error creating route:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const allRoute=async(req,res)=>{
    try {
        const conn=await connectDb();
        const [route]=await conn.promise().query("Select route_id,route_name from routes");
        return res.status(201).json(route);
    } catch (error) {
        console.error("Error in fetching all route:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const deleteRoute=async(req,res)=>{
    const {id}=req.params;
    try {
        const conn = await connectDb();
        const [route]=await conn.promise().query("Select * from routes where route_id=?",[id]);
        if(route.length===0){
            return res.status(404).json({ message: "Route not found" });
        }
        
        await conn.promise().query("CALL safe_delete_route(?)", [id]);
        return res.status(200).json({ message: "Route deleted successfully" });
    } catch (error) {
        if( error.code === "ER_SIGNAL_EXCEPTION") {
            return res.status(400).json({ message: error.sqlMessage });
        }
        console.error("Error deleting route:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const createBus=async(req,res)=>{
    const {bus_name,total_seats,route_id,variant_id}=req.body;
    if(!bus_name || !total_seats || !route_id || !variant_id){
        return res.status(400).json({message:"All fields are required"});
    }
    try {
        const conn=await connectDb();
        const [route]=await conn.promise().query("Select * from routes where route_id=?",[route_id]);
        if(route.length===0){
            return res.status(400).json({message:"Invalid route ID"});
        }
        const [variant]=await conn.promise().query("Select * from RouteVariants where route_variant_id=? and route_id=?",[variant_id,route_id]);
        if(variant.length===0){
            return res.status(400).json({message:"Invalid variant ID for the given route"});
        }
        await conn.promise().query("Insert into bus (bus_name,total_seats,route_id,route_variant_id) values (?,?,?,?)",[bus_name,total_seats,route_id,variant_id]);
        return res.status(201).json({message:"Bus created successfully"});
    } catch (error) {
        if (error.code === "ER_SIGNAL_EXCEPTION" && error.sqlMessage.includes("total_seats")) {
        return res.status(400).json({ message: "Invalid total_seats number." });
        }
        console.error("Error creating bus:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const deleteBus=async(req,res)=>{
    const {id}=req.params;
    try {
        const conn = await connectDb();
        const [bus]=await conn.promise().query("Select * from bus where bus_id=?",[id]);
        if(bus.length===0){
            return res.status(404).json({ message: "Bus not found" });
        }
        const [schedules]=await conn.promise().query("Select * from busschedule where bus_id=?",[id]);
        if(schedules.length>0){
            return res.status(400).json({ message: "Cannot delete bus with existing schedules. Please delete the schedules first." });
        }
        await conn.promise().query("CALL safe_delete_bus(?)", [id]);
        return res.status(200).json({ message: "Bus deleted successfully" });
    } catch (error) {
        if (error.code === "ER_SIGNAL_EXCEPTION" && error.sqlMessage.includes("Cannot delete")) {
            return res.status(400).json({ message: "Bus cannot be deleted as it has existing bookings or schedules." });
        }
        console.error("Error deleting bus:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const createStops=async(req,res)=>{
    let {stop_name}=req.body;
    stop_name=stop_name?.trim();
    stop_name=stop_name?.toLowerCase();
    if(!stop_name){
        return res.status(400).json({message:"Stop name is required"});
    }
    try {
        const conn=await connectDb();
        const [stops]=await conn.promise().query("Select * from bus_stops where stop_name=?",[stop_name]);
        if(stops.length>0){
            return res.status(400).json({message:"Stop name already exists"});
        }
        await conn.promise().query("Insert into bus_stops (stop_name) values (?)",[stop_name]);
        return res.status(201).json({message:"Stop created successfully"});
    } catch (error) {
        console.error("Error creating stop:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const deleteStops=async(req,res)=>{
    const {id}=req.params;
    try {
        const conn=await connectDb();
        const [stops]=await conn.promise().query("Select * from routestops where stop_id=?",[id]);
        if(stops.length>0){
            return res.status(400).json({message:"Cannot delete stop as it is associated with existing route variants"});
        }
        await conn.promise().query("Delete from bus_stops where stop_id=?",[id]);
        return res.status(200).json({message:"Stop deleted successfully"});
    } catch (error) {
        console.error("Error deleting stop:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const editStops=async(req,res)=>{
    const {id}=req.params;
    const {stop_name}=req.body;
    let trimmedName=stop_name?.trim();
    trimmedName=trimmedName?.toLowerCase();
    if(!trimmedName){
        return res.status(400).json({message:"New stop name is required"});
    }
    try {
        const conn=await connectDb();
        const [stops]=await conn.promise().query("Select * from bus_stops where stop_id=?",[id]);
        if(stops.length===0){
            return res.status(404).json({message:"Stop not found"});
        }
        await conn.promise().query("Update bus_stops set stop_name=? where stop_id=?",[trimmedName,id]);
        return res.status(200).json({message:"Stop updated successfully"});
    } catch (error) {
        console.error("Error updating stop:", error);
        return res.status(500).json({message:"Internal server error"});
    }
}

export const getAllStops=async(req,res)=>{
    try{
        const conn=await connectDb();
        const [stops]=await conn.promise().query("Select stop_name,stop_id from bus_stops");
        return res.status(200).json(stops);
    } catch (error) {
        console.error("Error fetching stops:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const addRouteVariant = async (req, res) => {
    const { route_id } = req.params;
    const { stops } = req.body;

    if (!stops || !Array.isArray(stops) || stops.length === 0) {
        return res.status(400).json({ message: "Stops are required" });
    }

    const conn = await connectDb();
    try {
        const sortedStops=stops.sort((a,b)=>a.stop_order-b.stop_order);
        const variant_name=sortedStops.map(s=>s.stop_id).join('_');

        const [route] = await conn.promise().query("SELECT * FROM routes WHERE route_id = ?", [route_id]);
        if (route.length === 0) {
            return res.status(400).json({ message: "Invalid route ID" });
        }
        const [existingVariant] = await conn.promise().query(
            "SELECT * FROM RouteVariants WHERE route_id = ? AND variant_name = ?", 
            [route_id, variant_name.trim().toLowerCase()]
        );
        if (existingVariant.length > 0) {
            return res.status(400).json({ message: "Variant already exists for this route" });
        }
        const [variantResult] = await conn.promise().query(
            "INSERT INTO RouteVariants (route_id, variant_name) VALUES (?, ?)", 
            [route_id, variant_name.trim().toLowerCase()]
        );
        const route_variant_id = variantResult.insertId;
        for (const stop of stops) {
            await conn.promise().query("CALL add_route_stop_variant(?,?, ?, ?)", [
                route_id,
                route_variant_id,
                stop.stop_id,
                stop.stop_order
            ]);
        }

        return res.status(201).json({ message: "Route variant added successfully" });

    } catch (error) {
        console.error("Error adding route variant:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const editRouteVariant = async (req, res) => {
    const { route_id, variant_id } = req.params;
    const { stops } = req.body;
    console.log(route_id);
    console.log(variant_id);

    if (!stops || !Array.isArray(stops) || stops.length === 0) {
        return res.status(400).json({ message: "Stops are required" });
    }
    const conn=await connectDb();
    const connProm=conn.promise();

    try {
        await connProm.query("Set session transaction isolation level read committed");
        await connProm.query("Start transaction");

        const [route]=await connProm.query("Select * from routes where route_id=?",[route_id]);
        if(route.length===0){
            await connProm.query("Rollback");
            return res.status(400).json({message:"Invalid route ID"});
        }
        const [variant]=await connProm.query("Select * from RouteVariants where route_variant_id=? and route_id=?",[variant_id,route_id]);
        console.log(variant.length);
        if(variant.length===0){
            await connProm.query("Rollback");
            return res.status(400).json({message:"Invalid variant ID for the given route"});
        }

        const [bookings]=await connProm.query(
            "Select count(*) from booking where route_variant_id=? and travel_date>=CURDATE()",
            [variant_id]
        );
        if(bookings[0].count>0){
            await connProm.query("Rollback");
            return res.status(400).json({message:"Cannot edit variant as there are existing or upcoming bookings for this variant"});
        }

        const [schedules]=await connProm.query(
            "Select count(*) from busschedule where route_variant_id=?",
            [variant_id]
        );
        if(schedules[0].count>0){
            await connProm.query("Delete from busschedule where route_variant_id=?",[variant_id]);
        }

        const sortedStops=stops.sort((a,b)=>a.stop_order-b.stop_order);
        const new_variant_name=sortedStops.map(s=>s.stop_id).join('_');
        console.log("New variant name:",new_variant_name);

        const [existingVariant]=await connProm.query(
            "Select * from RouteVariants where route_id=? and variant_name=? and route_variant_id=?",
            [route_id,new_variant_name,variant_id]
        );
        console.log("Existing variant check:",existingVariant);
        if(existingVariant.length>0){
            await connProm.query("Rollback");
            return res.status(400).json({message:"Another variant with the same stops already exists for this route"});
        }

        await connProm.query(
            "Update RouteVariants set variant_name=? where route_variant_id=?",
            [new_variant_name.trim().toLowerCase(),variant_id]
        );
        await connProm.query("Delete from RouteStops where route_id=? and route_variant_id=?",[route_id,variant_id]);

        for (const stop of stops) {
            await connProm.query("CALL add_route_stop_variant(?,?, ?, ?)", [
                route_id,
                variant_id,
                stop.stop_id,
                stop.stop_order
            ]);
        }
        await connProm.query("Commit");
        return res.status(200).json({ message: "Route variant updated successfully" });
    } catch (error) {
        if(error.code==="ER_SIGNAL_EXCEPTION"){
            console.error("Unique constraint violation:", error);
            await connProm.query("Rollback");
            return res.status(400).json({ message: error.sqlMessage });
        }
        console.error("Error updating route variant:", error);
        await connProm.query("Rollback");
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteRouteVariant = async (req, res) => {
    const { route_id, variant_id } = req.params;

    const conn = await connectDb();
    const connProm = conn.promise();

    try {
        await connProm.query("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");
        await connProm.query("START TRANSACTION");

        // Check if variant exists
        const [variant] = await connProm.query(
            "SELECT * FROM RouteVariants WHERE route_variant_id = ? AND route_id = ?",
            [variant_id, route_id]
        );
        if (variant.length === 0) {
            await connProm.query("ROLLBACK");
            return res.status(404).json({ message: "Variant not found for the given route" });
        }

        // Check for existing or upcoming bookings
        const [bookings] = await connProm.query(
            "SELECT COUNT(*) AS count FROM Booking WHERE route_variant_id = ? AND travel_date >= CURDATE()",
            [variant_id]
        );
        if (bookings[0].count > 0) {
            await connProm.query("ROLLBACK");
            return res.status(400).json({ message: "Cannot delete variant with existing or upcoming bookings" });
        }

        // Delete schedules
        await connProm.query("DELETE FROM BusSchedule WHERE route_variant_id = ?", [variant_id]);

        // Delete route stops
        await connProm.query("DELETE FROM RouteStops WHERE route_variant_id = ?", [variant_id]);

        // Delete the variant
        await connProm.query("DELETE FROM RouteVariants WHERE route_variant_id = ?", [variant_id]);

        await connProm.query("COMMIT");
        return res.status(200).json({ message: "Route variant deleted successfully" });

    } catch (error) {
        console.error("Error deleting route variant:", error);
        await connProm.query("ROLLBACK");
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const addBusSchedule=async(req,res)=>{
    const {bus_id}=req.params;
    const {stop_schedules}=req.body;

    if(!stop_schedules || !Array.isArray(stop_schedules) || stop_schedules.length===0){
        return res.status(400).json({message:"Stop schedules are required"});
    }
    try {
        const conn=await connectDb();
        const [bus]=await conn.promise().query("Select * from bus where bus_id=?",[bus_id]);
        if(bus.length===0){
            return res.status(400).json({message:"Invalid bus ID"});
        }
        const route_variant_id=bus[0].route_variant_id;
        const route_id=bus[0].route_id;
        const [schedules]=await conn.promise().query("Select * from busschedule where bus_id=?",[bus_id]);
        if(schedules.length>0){
            return res.status(400).json({message:"Schedule already exists for this bus try editing instead"});
        }

        for(const schedule of stop_schedules){
            const {stop_id,arrival_time,departure_time}=schedule;
            if(!stop_id || !arrival_time || !departure_time){
                return res.status(400).json({message:"All fields in stop schedules are required"});
            }

            const [stop]=await conn.promise().query("Select * from bus_stops where stop_id=?",[stop_id]);
            if(stop.length===0){
                return res.status(400).json({message:`Invalid stop ID: ${stop_id}`});
            }
        }
        for(const schedule of stop_schedules){
            const {stop_id,arrival_time,departure_time}=schedule;
            await conn.promise().query("Call add_valid_bus_schedule(?,?,?,?,?,?)",
                [bus_id,route_id,route_variant_id,stop_id,arrival_time,departure_time]
            );
        }
        return res.status(201).json({message:"Bus schedule added successfully"});
    } catch (error) {
        console.error("Error adding bus schedule:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const editBusSchedule=async(req,res)=>{
    const {bus_id}=req.params;
    const {stop_schedules}=req.body;

    if(!stop_schedules || !Array.isArray(stop_schedules) || stop_schedules.length===0){
        return res.status(400).json({message:"Stop schedules are required"});
    }
    const conn = await connectDb();
    const connProm = conn.promise();

    try {
        const [bus]=await connProm.query("Select * from bus where bus_id=?",[bus_id]);
        if(bus.length===0){
            return res.status(400).json({message:"Invalid bus ID"});
        }
        const route_variant_id=bus[0].route_variant_id;
        const route_id=bus[0].route_id;
        const [schedules]=await connProm.query("Select * from busschedule where bus_id=?",[bus_id]);
        if(schedules.length===0){
            return res.status(400).json({message:"No existing schedule for this bus to edit"});
        }

        for(const schedule of stop_schedules){
            const {stop_id,arrival_time,departure_time}=schedule;
            if(!stop_id || !arrival_time || !departure_time){
                return res.status(400).json({message:"All fields in stop schedules are required"});
            }

            const [stop]=await connProm.query("Select * from bus_stops where stop_id=?",[stop_id]);
            if(stop.length===0){
                return res.status(400).json({message:`Invalid stop ID: ${stop_id}`});
            }
        }
        const [booking]=await connProm.query(
            "Select count(*) as count from booking where bus_id=? and travel_date>=CURDATE()",
            [bus_id]
        );
        if(booking[0].count>0){
            return res.status(400).json({message:"Cannot edit schedule as there are existing or upcoming bookings for this bus"});
        }
        await connProm.query("Set session transaction isolation level read committed");
        await connProm.query("Start transaction");
        await connProm.query("Delete from busschedule where bus_id=?",[bus_id]);
        for(const schedule of stop_schedules){
            const {stop_id,arrival_time,departure_time}=schedule;
            await connProm.query("Call add_valid_bus_schedule(?,?,?,?,?,?)",
                [bus_id,route_id,route_variant_id,stop_id,arrival_time,departure_time]
            );
        }
        await connProm.query("Commit");
        return res.status(201).json({message:"Bus schedule added successfully"});
    } catch (error) {
        if(error.code==="ER_SIGNAL_EXCEPTION"){
            return res.status(400).json({ message: error.sqlMessage });
        }
        await connProm.query("Rollback");
        console.error("Error adding bus schedule:", error);
        return res.status(500).json({message:"Internal server error"});
    }finally{
        conn.end();
    }
};

export const deleteBusSchedule=async(req,res)=>{
    const {bus_id}=req.params;
    try {
        const conn=await connectDb();
        const [bus]=await conn.promise().query("Select * from bus where bus_id=?",[bus_id]);
        if(bus.length===0){
            return res.status(400).json({message:"Invalid bus ID"});
        }
        console.log("Bus details:",bus);
        const route_id=bus[0].route_id;
        const route_variant_id=bus[0].route_variant_id;
        const [schedules]=await conn.promise().query("Select * from busschedule where bus_id=?",[bus_id]);
        if(schedules.length===0){
            return res.status(400).json({message:"No existing schedule for this bus to delete"});
        }
        const [booking]=await conn.promise().query(
            "Select count(*) as count from booking where bus_id=? and travel_date>=CURDATE()",
            [bus_id]
        );
        if(booking[0].count>0){
            return res.status(400).json({message:"Cannot delete schedule as there are existing or upcoming bookings for this bus"});
        }
        await conn.promise().query("Delete from busschedule where bus_id=?",[bus_id]);
        return res.status(200).json({message:"Bus schedule deleted successfully"});
    } catch (error) {
        console.error("Error deleting bus schedule:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const getPayHistory = async (req, res) => {
  let { days } = req.body;
  days=days-1;
  try {
    const conn = await connectDb();

    // Fetch payments made within the last 'days' days
    const [history] = await conn.promise().query(
        "SELECT amount, payment_method, payment_date, status FROM payment WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) ORDER BY payment_date DESC",
        [Number(days)]
      );

    // Compute total earning within the same period
    const [amountRows] = await conn.promise()
      .query(
        "SELECT SUM(amount) AS totalEarning FROM payment WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)",
        [Number(days)]
      );

    const totalEarning = amountRows[0]?.totalEarning || 0;

    return res.status(200).json({ history, earning: totalEarning });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

