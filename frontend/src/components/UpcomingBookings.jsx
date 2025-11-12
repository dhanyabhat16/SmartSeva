import React, { useEffect } from "react";
import { useBookStore } from "../store/useBookStore.js";

const UpcomingBookings = () => {
  const { upcomingBookings, getUpcomingBookings } = useBookStore();

  useEffect(() => {
    getUpcomingBookings();
  }, []);

  return (
    <div className="bg-base-100 shadow-md rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-base-content mb-3 border-b pb-2 border-base-300">
        Upcoming Bookings
      </h3>

      {upcomingBookings.length === 0 ? (
        <p className="text-base-content/60">No upcoming bookings found.</p>
      ) : (
        <div className="space-y-4">
          {upcomingBookings.map((b, idx) => (
            <div
              key={idx}
              className="border border-base-300 rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-base-200 transition-all"
            >
              {/* Left Section — Route + Details */}
              <div>
                <p className="font-semibold text-base-content text-lg">
                  {b.source_stop} → {b.destination_stop}
                </p>

                <div className="mt-1 space-y-0.5 text-sm text-base-content/80">
                  <p>
                    <span className="font-medium text-base-content">Bus ID:</span> {b.bus_id}
                  </p>
                  <p>
                    <span className="font-medium text-base-content">Bus Name:</span> {b.bus_name}
                  </p>
                  <p>
                    <span className="font-medium text-base-content">Date:</span>{" "}
                    {new Date(b.travel_date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium text-base-content">Seat:</span> {b.seat_number}
                  </p>
                  
                </div>
              </div>

              {/* Right Section — Fare + Payment */}
              <div className="mt-3 sm:mt-0 text-right">
                <p className="text-primary font-semibold text-lg">
                  ₹{b.amount || "—"}
                </p>
                {b.payment_method && (
                  <p className="text-xs text-base-content/60">
                    {b.payment_method.toUpperCase()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingBookings;
