import React, { useEffect, useState } from "react";
import { useBookStore } from "../store/useBookStore";
import { useNavigate, useParams } from "react-router-dom";
import { Bus } from "lucide-react";
import BusSummaryCard from "../components/BusSummaryCard";

const BusSeatLayoutPage = () => {
  const {
    selectedbus,
    selectedsrc,
    selecteddst,
    traveldate,
    bookedSeats,
    getBookedSeats,
    setselectedseat,
    selectedseat
  } = useBookStore();

  const { bus_id } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
useEffect(() => {
  console.log("Selected seat updated:", selectedseat);
}, [selectedseat]);

  useEffect(() => {
    if (!selectedbus || !selectedsrc || !selecteddst || !traveldate) {
      navigate("/book-bus");
      return;
    }
    getBookedSeats(selectedbus.bus_id, selectedsrc, selecteddst, traveldate);
  }, [selectedbus, selectedsrc, selecteddst, traveldate, navigate, getBookedSeats]);

  if (!selectedbus) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-lg text-base-content/70 mb-4">No bus selected.</p>
        <button
          onClick={() => navigate("/book-bus")}
          className="px-6 py-2 bg-primary text-base-content rounded-lg font-semibold hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    );
  }

  const totalSeats = selectedbus.total_seats || 40;
  const seatsPerRow = 4;

const handleSeatClick = async(seatNumber) => {
  if (bookedSeats.includes(seatNumber)) return;
  setSelectedSeats((prev) =>
    prev.includes(seatNumber) ? [] : [seatNumber] // allow only one seat at a time
  );
  await setselectedseat(seatNumber);
  console.log(selectedseat);
};


  return (
  <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
    <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
      
      {/* Left: Seat Layout */}
      <div className="flex flex-col items-center gap-4">
        

        <div className="bg-base-100 p-6 rounded-2xl shadow-lg border border-base-300 inline-block">
          <div
            className="grid gap-y-3"
            style={{
              gridTemplateColumns: "repeat(5, 3rem)", // 4 seats + aisle
              columnGap: "2rem",
            }}
          >
            {Array.from({ length: totalSeats }, (_, i) => {
              const seatNumber = i + 1;
              const isBooked = bookedSeats.includes(seatNumber);
              const isSelected = selectedSeats.includes(seatNumber);
              const colIndex = i % seatsPerRow;
              const isAisleAfter = colIndex === 1;

              return (
                <React.Fragment key={seatNumber}>
                  <button
                    onClick={() => handleSeatClick(seatNumber)}
                    disabled={isBooked}
                    className={`w-12 h-12 flex items-center justify-center rounded-md border-2 font-semibold transition-all 
                      ${
                        isBooked
                          ? "bg-error/60 border-error/70 text-pase content cursor-not-allowed"
                          : isSelected
                          ? "bg-primary text-primary-content border-primary"
                          : "bg-base-200 hover:bg-primary/20 border-base-300"
                      }`}
                  >
                    {seatNumber}
                  </button>
                  {isAisleAfter && <div className="w-8"></div>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Bus Summary */}
      <div className="flex justify-center">
        <BusSummaryCard
          bus={selectedbus}
          src={selectedsrc}
          dst={selecteddst}
          date={traveldate}
          selectedSeats={selectedSeats}
        />
      </div>
    </div>
  </div>
);

};

export default BusSeatLayoutPage;
