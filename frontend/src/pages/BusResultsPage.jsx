// src/pages/BusResultsPage.jsx
import React from "react";
import { useBookStore } from "../store/useBookStore";
import { Clock, MapPin, Users, AlertCircle, BadgeInfo } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BusResultsPage = () => {
  const { srcdstbuses, traveldate,setselectedbus,selectedbus } = useBookStore();
  const navigate = useNavigate();

  if (!srcdstbuses || srcdstbuses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-semibold text-base-content/80">
          No buses found 
        </h2>
        <p className="text-base-content/60 mt-2">
          Try changing your route or date.
        </p>
        <button
          onClick={() => navigate("/book-bus")}
          className="mt-6 px-6 py-2 rounded-lg bg-primary text-primary-content font-semibold hover:bg-primary/90 transition"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4 md:px-16">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center">
        Available Buses for {traveldate}
      </h1>

      <div className="space-y-6">
        {srcdstbuses.map((bus) => (
          <div
            key={bus.bus_id}
            className="bg-base-100 rounded-2xl shadow-md hover:shadow-lg transition p-6 flex flex-col md:flex-row md:justify-between md:items-center border border-base-300"
          >
            {/* Left section: Bus Info */}
            <div>
              <h2 className="text-xl font-bold text-base-content capitalize">
                {bus.bus_name}
              </h2>

              {/* Bus ID */}
              <div className="flex items-center gap-1 mt-1 text-base-content/70 text-sm">
                <BadgeInfo className="h-4 w-4 text-primary" />
                <span>Bus ID: {bus.bus_id}</span>
              </div>

              {/* Section stops */}
              <div className="flex items-center gap-2 mt-2 text-base-content/80 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{bus.section_stops}</span>
              </div>

              {/* Departure / Arrival or Not Scheduled */}
              {bus.src_departure_time && bus.dst_arrival_time ? (
                <div className="flex items-center gap-2 mt-2 text-base-content/80 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>
                    Departure:{" "}
                    <span className="font-semibold">
                      {bus.src_departure_time.slice(0, 5)}
                    </span>{" "}
                    | Arrival:{" "}
                    <span className="font-semibold">
                      {bus.dst_arrival_time.slice(0, 5)}
                    </span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2 text-error text-sm font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  <span>Not Scheduled Yet</span>
                </div>
              )}

              
            </div>

            {/* Right section: Book Button */}
            <button
              onClick={async() => {
                await setselectedbus(bus);
                navigate(`/bus/${bus.bus_id}`);
              }}
              className="mt-4 md:mt-0 px-6 py-2 bg-primary text-primary-content rounded-full font-semibold hover:bg-primary/90 transition"
            >
              View Seats
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusResultsPage;
