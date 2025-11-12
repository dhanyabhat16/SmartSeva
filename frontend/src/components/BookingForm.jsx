import React, { useState, useEffect } from "react";
import { useBookStore } from "../store/useBookStore.js";
import { FaBus, FaRegCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const BookingForm = () => {
    const navigate = useNavigate();
  const { stops, getStops, getAllSrcDstBus, srcdstbuses,traveldate,setdate ,setselectedsrc,setselecteddst} = useBookStore();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [filteredFrom, setFilteredFrom] = useState([]);
  const [filteredTo, setFilteredTo] = useState([]);
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);

  useEffect(() => {
    if (!stops || stops.length === 0) getStops();
  }, [stops, getStops]);

  useEffect(() => {
    setFilteredFrom(
      from ? stops.filter((s) => s.toLowerCase().includes(from.toLowerCase())) : []
    );
  }, [from, stops]);

  useEffect(() => {
    setFilteredTo(
      to ? stops.filter((s) => s.toLowerCase().includes(to.toLowerCase())) : []
    );
  }, [to, stops]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!from || !to || !date) return;
    await getAllSrcDstBus({ src: from, dst: to });
    await setdate(date);
    await setselectedsrc(from);
    await setselecteddst(to);

    console.log(traveldate);
    console.log(srcdstbuses);
    navigate("/bus-results");
    console.log("Navigated");
  };

  return (
    <div className="relative w-full flex justify-center mt-12 mb-20 px-3">
      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-6xl bg-base-100 border border-base-300 rounded-3xl shadow-lg flex flex-col md:flex-row items-center px-3 py-5 gap-3 md:gap-0 mb-4"
      >
        {/* From */}
        <div className="relative flex-1 flex items-center gap-3 px-4 py-2">
          <FaBus className="text-primary text-xl" />
          <input
            type="text"
            placeholder="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            onFocus={() => setFromFocused(true)}
            onBlur={() => setTimeout(() => setFromFocused(false), 100)}
            className="input input-ghost w-full text-lg focus:outline-none"
          />
          {fromFocused && filteredFrom.length > 0 && (
            <ul className="absolute top-full left-0 w-full bg-base-100 border border-base-200 rounded-xl shadow-lg max-h-60 overflow-auto z-50">
              {filteredFrom.map((stop, idx) => (
                <li
                  key={idx}
                  onMouseDown={() => setFrom(stop)}
                  className="px-4 py-2 cursor-pointer hover:bg-primary/10 transition"
                >
                  {stop}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hidden md:block h-8 border-l border-base-300" />

        {/* To */}
        <div className="relative flex-1 flex items-center gap-3 px-4 py-2">
          <FaBus className="text-primary text-xl rotate-180" />
          <input
            type="text"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onFocus={() => setToFocused(true)}
            onBlur={() => setTimeout(() => setToFocused(false), 100)}
            className="input input-ghost w-full text-lg focus:outline-none"
          />
          {toFocused && filteredTo.length > 0 && (
            <ul className="absolute top-full left-0 w-full bg-base-100 border border-base-200 rounded-xl shadow-lg max-h-60 overflow-auto z-50">
              {filteredTo.map((stop, idx) => (
                <li
                  key={idx}
                  onMouseDown={() => setTo(stop)}
                  className="px-4 py-2 cursor-pointer hover:bg-primary/10 transition"
                >
                  {stop}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hidden md:block h-8 border-l border-base-300" />

        {/* Date */}
        <div className="flex items-center gap-3 px-4 py-2 min-w-[220px]">
          <FaRegCalendarAlt className="text-primary text-xl" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent border-none outline-none text-lg font-semibold text-primary"
          />
          <div className="flex gap-2 ml-3">
            <button
              type="button"
              onClick={() => setDate(new Date().toISOString().split("T")[0])}
              className="px-3 py-1 rounded-full text-sm bg-red-100 text-primary font-medium hover:bg-red-200 transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setDate(tomorrow.toISOString().split("T")[0]);
              }}
              className="px-3 py-1 rounded-full text-sm bg-red-100 text-primary font-medium hover:bg-red-200 transition"
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Floating Search Button */}
        <button
          type="submit"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[70%] border-2 border-primary
            bg-base-300 hover:bg-primary text-base-content font-semibold rounded-full 
            text-lg px-10 h-14 shadow-xl transition-all duration-300 flex items-center gap-2"
        >
        Search Buses
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
