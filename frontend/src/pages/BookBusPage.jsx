import React from "react";
import BusCarousel from "../components/BusCarousel";
import BookingForm from "../components/BookingForm";

const BookBusPage = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center pb-10">
      <BusCarousel />
      <BookingForm />
    </div>
  );
};

export default BookBusPage;
