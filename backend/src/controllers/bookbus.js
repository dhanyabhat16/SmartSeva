import { connectDb } from "../lib/db.js";

export const getAllRoutes=async(req,res)=>{
    const conn=await connectDb();
    try {
        const [routes]=await conn.promise().query("Select route_name,route_id from routes");
        return res.status(200).json(routes);
    } catch (error) {
        console.log("Error fetching routes:",error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const getAllRouteVariants=async(req,res)=>{
    const conn = await connectDb();
    const {route_id}=req.params;
    try {
        const [variants]=await conn.promise().query("Select variant_name,route_variant_id as variant_id from routevariants where route_id=?", [route_id]);
        //replace the stopid numbers with stop names eg 1_3_2-> "StopA_StopC_StopB"
        // replace stop IDs with stop names like 1_3_2 → "StopA_StopC_StopB"
    for (let variant of variants) {
            // Call your MySQL function to convert stop IDs → stop names
            const [result] = await conn
                .promise()
                .query("SELECT get_stop_names_from_ids(?) AS stops_readable", [variant.variant_name]);

            // Assign the readable string to the variant
            variant.stops_readable = result[0].stops_readable;
    }
        return res.status(200).json({variants});
    } catch (error) {
        console.log("Error fetching route variants:",error);
        return res.status(500).json({message:"Internal server error"});
    }finally{
        conn.end();
    }
};

export const getAllBus=async(req,res)=>{
    const conn=await connectDb();
    try {
        const [buses] = await conn.promise().query(`
            SELECT 
                b.bus_id,
                b.bus_name,
                b.total_seats,
                b.route_id,
                b.route_variant_id,
                r.route_name,
                get_stop_names_from_ids(rv.variant_name) AS stops
            FROM bus b
            JOIN routes r ON b.route_id = r.route_id
            JOIN routevariants rv ON b.route_variant_id = rv.route_variant_id
        `);

        for (const bus of buses) {
            const [schedule] = await conn.promise().query(`
                SELECT 
                    bs.stop_id,
                    s.stop_name,
                    bs.arrival_time,
                    bs.departure_time
                FROM busschedule bs
                JOIN bus_stops s ON bs.stop_id = s.stop_id
                WHERE bs.bus_id = ?
                ORDER BY bs.arrival_time
            `, [bus.bus_id]);

            bus.schedule = schedule;
        }

        return res.status(200).json(buses);
    } catch (error) {
        console.log("Error fetching buses:",error);
        return res.status(500).json({message:"Internal server error"});
    }finally{
        conn.end();
    }
};

export const getAllRouteBuses=async(req,res)=>{
    const conn=await connectDb();
    const {route_id}=req.params;
    try {
        const [buses] = await conn.promise().query(`
            SELECT 
                b.bus_id,
                b.bus_name,
                b.total_seats,
                b.route_id,
                b.route_variant_id,
                r.route_name,
                get_stop_names_from_ids(rv.variant_name) AS stops
            FROM bus b
            JOIN routes r ON b.route_id = r.route_id
            JOIN routevariants rv ON b.route_variant_id = rv.route_variant_id
            WHERE b.route_id = ?
        `, [route_id]);

        for (const bus of buses) {
            const [schedule] = await conn.promise().query(`
                SELECT 
                    bs.stop_id,
                    s.stop_name,
                    bs.arrival_time,
                    bs.departure_time
                FROM busschedule bs
                JOIN bus_stops s ON bs.stop_id = s.stop_id
                WHERE bs.bus_id = ?
                ORDER BY bs.arrival_time
            `, [bus.bus_id]);

            bus.schedule = schedule;
        }
        return res.status(200).json({buses});
    } catch (error) {
        console.log("Error fetching route buses:",error);
        return res.status(500).json({message:"Internal server error"});
    }finally{
        conn.end();
    }
};