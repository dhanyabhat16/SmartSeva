import React, { useState, useEffect } from "react";
import { MapPin, Clock, BadgeInfo, AlertCircle, CheckCircle } from "lucide-react";
import { useBookStore } from "../store/useBookStore";
import { useNavigate } from "react-router-dom";

const BusSummaryCard = ({ bus, src, dst, date, selectedSeats }) => {
  const { bookbus, setselectedseat, amount } = useBookStore();
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (selectedSeats.length === 0) return;
    setselectedseat(selectedSeats[0]);

    const successStatus = await bookbus();
    if (successStatus !== false) {
      setSuccess(true);
    }
  };

  // ⏱ Handle countdown + auto redirect
  useEffect(() => {
    if (success) {
      const interval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      const timeout = setTimeout(() => navigate("/book-bus"), 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [success, navigate]);

  if (!bus) return null;

  // ✅ Success message with live countdown
  if (success) {
    return (
      <div className="bg-base-100 shadow-lg rounded-2xl p-8 border border-base-300 w-full md:w-80 lg:w-96 text-center animate-fade-in">
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Successful!</h2>
        <p className="text-base-content/70 mb-4">Thank you for booking with us 🎉</p>

        <div className="bg-base-200 rounded-xl p-4 text-left mb-4">
          <p className="font-semibold text-primary mb-1">{bus.bus_name}</p>
          <p className="text-sm text-base-content/80 mb-1">
            <MapPin className="inline w-4 h-4 mr-1 text-primary" />
            {src} → {dst}
          </p>
          <p className="text-sm text-base-content/80 mb-1">
            <Clock className="inline w-4 h-4 mr-1 text-primary" />
            Date: {date}
          </p>
          <p className="text-sm text-base-content/80 mb-1">
            Seat No: <span className="font-semibold">{selectedSeats.join(", ")}</span>
          </p>
          <p className="text-sm text-base-content/80">
            Payment: <span className="font-bold text-green-600">₹{amount || "N/A"}</span>
          </p>
        </div>

        <p className="text-sm text-base-content/70 mb-4">
          Redirecting to booking page in{" "}
          <span className="font-medium text-primary">{countdown}</span> seconds...
        </p>

<h2 className="text-2xl font-bold text-green-600 mb-2">Ticket is available in your profile!</h2>
        <button
          onClick={() => navigate("/book-bus")}
          className="px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition"
        >
          Go Back Now
        </button>
      </div>
    );
  }

  // 🚌 Default summary card
  return (
    <div className="bg-base-100 shadow-md rounded-2xl p-6 border border-base-300 w-full md:w-80 lg:w-96">
      <h2 className="text-xl font-bold text-primary mb-3">{bus.bus_name}</h2>

      <div className="space-y-3 text-base-content/80 text-sm">
        <div className="flex items-center gap-2">
          <BadgeInfo className="h-4 w-4 text-primary" />
          <span>Bus ID: {bus.bus_id}</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>
            {src} → {dst}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          {bus.src_departure_time && bus.dst_arrival_time ? (
            <span>
              {bus.src_departure_time.slice(0, 5)} → {bus.dst_arrival_time.slice(0, 5)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-error font-medium">
              <AlertCircle className="h-4 w-4" /> Not Scheduled
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span>Date: {date}</span>
        </div>

        {selectedSeats.length > 0 && (
          <div className="pt-2 border-t border-base-300">
            <p className="font-semibold">
              Selected Seat: <span className="text-primary">{selectedSeats.join(", ")}</span>
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handlePayment}
        disabled={selectedSeats.length === 0}
        className="w-full mt-5 py-3 bg-primary text-primary-content font-semibold rounded-full hover:bg-primary/90 transition disabled:bg-base-300 disabled:text-base-content/60"
      >
        Complete Payment
      </button>
    </div>
  );
};

export default BusSummaryCard;
