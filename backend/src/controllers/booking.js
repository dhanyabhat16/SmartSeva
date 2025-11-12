import { connectDb } from "../lib/db.js";

export const getAllBuses=async(req,res)=>{
    //steps to be followed
    //1 filter route variants that contain src and dst as their stop ids
    //2 ensure src comes before dst
    //3 thus u get the variants that are valid 
    //4 fetch the buses that follow this variant
    //5 cal the departure and the arrival timings
    //6 collect intermediate stops
    //7 sorted by departure in ascending
    let {src,dst}=req.body;
    src = src?.toLowerCase();
    dst = dst?.toLowerCase();   
    try {
        if(!src || !dst){
            return res.status(400).json({message:"Source and destination required"});
        }
        if(src==dst){
            return res.status(400).json({message:"invlaid Source and destination"});
        }
        const conn=await connectDb();
        let src_id= await conn.promise().query("Select stop_id from bus_stops where stop_name=?",[src]); 
        let dst_id=await conn.promise().query("Select stop_id from bus_stops where stop_name=?",[dst]);
        src_id=src_id[0][0].stop_id;
        dst_id=dst_id[0][0].stop_id;
        
        const [buses]=await conn.promise().query(`
            SELECT 
            b.bus_id,
            b.bus_name,
            b.total_seats,
            r.route_id,
            r.route_name,
            rv.route_variant_id,
            rv.variant_name,
            MIN(s_src.departure_time) AS src_departure_time,
            MIN(s_dst.arrival_time) AS dst_arrival_time,
            GROUP_CONCAT(bs.stop_name ORDER BY rs.stop_order SEPARATOR ' -> ') AS section_stops
        FROM bus b
        JOIN routevariants rv ON b.route_variant_id = rv.route_variant_id
        JOIN routes r ON rv.route_id = r.route_id
        JOIN routestops src_rs ON rv.route_variant_id = src_rs.route_variant_id AND src_rs.stop_id = ?
        JOIN routestops dst_rs ON rv.route_variant_id = dst_rs.route_variant_id AND dst_rs.stop_id = ?
        JOIN routestops rs ON rv.route_variant_id = rs.route_variant_id
            AND rs.stop_order BETWEEN src_rs.stop_order AND dst_rs.stop_order 
        JOIN bus_stops bs ON rs.stop_id = bs.stop_id
        LEFT JOIN busschedule s_src ON b.bus_id = s_src.bus_id AND s_src.stop_id = src_rs.stop_id
        LEFT JOIN busschedule s_dst ON b.bus_id = s_dst.bus_id AND s_dst.stop_id = dst_rs.stop_id
        WHERE src_rs.stop_order < dst_rs.stop_order
        GROUP BY b.bus_id, rv.variant_name
        ORDER BY src_departure_time;


        `, [src_id, dst_id]);

        if(buses.length==0){
            return res.status(400).json({message:"No buses available for this route"});
        }
        res.status(200).json(buses);
    } catch (error) {
        console.error("Error in fetching the buses: ",error);
        res.status(500).json({message:"Internal server error"});
    }
};

export const bookbus=async(req,res)=>{
    const {bus_id}=req.params;
    const{src,dst,seat_number,travel_date,payment_method}=req.body;

    try {
        if(!src,!dst,!seat_number,!travel_date){
            return res.status(400).json({message:"all the fields are required"});
        }
        const conn=await connectDb();
        const [srcStopResult] = await conn.promise().query(
      `SELECT stop_id FROM bus_stops WHERE stop_name = ?`,
      [src]
    );
    const [dstStopResult] = await conn.promise().query(
      `SELECT stop_id FROM bus_stops WHERE stop_name = ?`,
      [dst]
    );

    if (!srcStopResult.length || !dstStopResult.length) {
      return res.status(404).json({ message: "Invalid source or destination stop" });
    }

    const src_id = srcStopResult[0].stop_id;
    const dst_id = dstStopResult[0].stop_id;
        const [bus]=await conn.promise().query("Select route_variant_id from bus where bus_id=?",[bus_id]);
        if(bus.length==0){
            return res.status(400).json({message:"Bus with this id does not exist"});
        }
        const route_variant_id=bus[0].route_variant_id;
        const citizen_id=req.user.citizen_id;

        const [fareResult] = await conn.promise().query(
        "SELECT calculate_fare(?, ?, ?) AS fare",
        [route_variant_id, src_id, dst_id]
        );
        const fare = fareResult[0]?.fare;
        if (!fare) {
        return res.status(400).json({ message: "Invalid source or destination order" });
        }

        await conn.promise().query("CALL book_ticket(? ,? , ?, ?, ?, ?, ?, ?, ?)", [
            citizen_id,
            bus_id,
            route_variant_id,
            src_id,
            dst_id,
            seat_number,
            travel_date,
            fare,
            payment_method || "Online",
        ]);
        //bus booking left
        return res.status(200).json({ message: "Bus booked successfully", amount_paid: fare });
    } catch (error) {
        console.log("Error in booking bus",error);
        if (error.sqlMessage) {
        // If the trigger or function raises a SIGNAL
        return res.status(400).json({ message: error.sqlMessage });
        }
        res.status(500).json({message:"Internal server error"});
    }
};

export const getAllPastBook=async(req,res)=>{
    const citizen_id=req.user.citizen_id;
    try {
        const conn=await connectDb();
        const [bookings]=await conn.promise().query(`
            select 
            b.bus_id,
            bs.bus_name,
            c.name as citizen_name,
            src.stop_name as source_stop,
            dst.stop_name as destination_stop,
            b.seat_number,
            b.travel_date,
            p.amount,
            p.payment_method,
            p.status
            from booking b
            join citizen c on b.citizen_id=c.citizen_id
            join bus bs on bs.bus_id=b.bus_id
            JOIN bus_stops src ON src.stop_id = b.src_stop_id
            JOIN bus_stops dst ON dst.stop_id = b.dst_stop_id
            LEFT JOIN payment p ON p.booking_id = b.booking_id
            WHERE b.travel_date < CURDATE() AND b.citizen_id = ?
            ORDER BY b.travel_date DESC;
        `,[citizen_id]);

        if(bookings.length==0){
            return res.status(200).json({message:"no past bookings"});
        }
        return res.status(200).json({bookings});
        
    } catch (error) {
        console.log("Error in fetching past boskings: ",error);
        return res.status(400).json({message:"Internal server error"});
    }
};

export const getAllfuturebook=async(req,res)=>{
    const citizen_id=req.user.citizen_id;
    try {
        const conn=await connectDb();
        const [bookings]=await conn.promise().query(`
            select 
            b.bus_id,
            bs.bus_name,
            c.name as citizen_name,
            src.stop_name as source_stop,
            dst.stop_name as destination_stop,
            b.seat_number,
            b.travel_date,
            p.amount,
            p.payment_method,
            p.status
            from booking b
            join citizen c on b.citizen_id=c.citizen_id
            join bus bs on bs.bus_id=b.bus_id
            JOIN bus_stops src ON src.stop_id = b.src_stop_id
            JOIN bus_stops dst ON dst.stop_id = b.dst_stop_id
            LEFT JOIN payment p ON p.booking_id = b.booking_id
            WHERE b.travel_date >= CURDATE() AND b.citizen_id = ?
            ORDER BY b.travel_date DESC;
        `,[citizen_id]);

        if(bookings.length==0){
            return res.status(200).json({message:"no future bookings"});
        }
        return res.status(200).json({bookings});
        
    } catch (error) {
        console.log("Error in fetching future boskings: ",error);
        return res.status(400).json({message:"Internal server error"});
    }
};

export const bookedseats = async (req, res) => {
  try {
    const conn=await connectDb();
    const db=await conn.promise();
    const { bus_id } = req.params;
    const { src, dst, travel_date } = req.body;

    if (!bus_id || !src || !dst || !travel_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1️⃣ Get the route_variant_id for this bus
    const [routeVariantResult] = await db.query(
      `SELECT route_variant_id FROM bus WHERE bus_id = ?`,
      [bus_id]
    );
    console.log(routeVariantResult);

    if (!routeVariantResult.length) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const v_route_variant_id = routeVariantResult[0].route_variant_id;
    console.log(v_route_variant_id);

    // 2️⃣ Convert stop names (src, dst) → stop_id
    const [srcStopResult] = await db.query(
      `SELECT stop_id FROM bus_stops WHERE stop_name = ?`,
      [src]
    );
    const [dstStopResult] = await db.query(
      `SELECT stop_id FROM bus_stops WHERE stop_name = ?`,
      [dst]
    );

    if (!srcStopResult.length || !dstStopResult.length) {
      return res.status(404).json({ message: "Invalid source or destination stop" });
    }

    const src_stop_id = srcStopResult[0].stop_id;
    const dst_stop_id = dstStopResult[0].stop_id;

    console.log(src_stop_id);console.log(dst_stop_id);

    // 3️⃣ Get stop_order of src and dst for the new segment
    const [[srcOrderResult]] = await db.query(
      `SELECT stop_order FROM routestops WHERE route_variant_id = ? AND stop_id = ?`,
      [v_route_variant_id, src_stop_id]
    );
    const [[dstOrderResult]] = await db.query(
      `SELECT stop_order FROM routestops WHERE route_variant_id = ? AND stop_id = ?`,
      [v_route_variant_id, dst_stop_id]
    );

    if (!srcOrderResult || !dstOrderResult) {
      return res.status(404).json({ message: "Stops not part of this route" });
    }

    const new_src_order = srcOrderResult.stop_order;
    const new_dst_order = dstOrderResult.stop_order;

    // 4️⃣ Find all booked seat numbers that overlap with this segment
    const [bookedSeats] = await db.query(
      `
      SELECT DISTINCT b.seat_number
      FROM booking b
      JOIN routestops rs_src 
          ON rs_src.stop_id = b.src_stop_id AND rs_src.route_variant_id = ?
      JOIN routestops rs_dst 
          ON rs_dst.stop_id = b.dst_stop_id AND rs_dst.route_variant_id = ?
      WHERE b.bus_id = ?
        AND b.travel_date = ?
        AND NOT (
            ? <= rs_src.stop_order   -- new segment ends before existing starts
            OR ? >= rs_dst.stop_order -- new segment starts after existing ends
        )
      `,
      [
        v_route_variant_id,
        v_route_variant_id,
        bus_id,
        travel_date,
        new_dst_order,
        new_src_order,
      ]
    );

    // 5️⃣ Return the list of booked seat numbers
    const bookedSeatNumbers = bookedSeats.map((row) => row.seat_number);
    res.status(200).json({ bookedSeats: bookedSeatNumbers });
  } catch (err) {
    console.error("Error fetching booked seats:", err);
    res.status(500).json({ message: "Server error" });
  }
};
