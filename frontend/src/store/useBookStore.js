import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useBookStore = create((set, get) => ({
  stops: [],
  srcdstbuses: [],
  traveldate: null,
  selectedbus: null,
  bookedSeats: [],
  selectedsrc: null,
  selecteddst: null,
  selectedseat: null,
  amount: null,

  upcomingBookings: [],
  pastBookings: [],

  setselectedsrc: (src) => set({ selectedsrc: src }),
  setselecteddst: (dst) => set({ selecteddst: dst }),
  setselectedseat: (seat) => set({ selectedseat: seat }),
  setdate: (date) => set({ traveldate: date }),
  setselectedbus: (bus) => {
    set({ selectedbus: bus });
    console.log("Selected bus in store:", get().selectedbus);
  },

  // ✅ Fetch all stops
  getStops: async () => {
    try {
      const res = await axiosInstance.get("/admin/getAllStops");
      set({ stops: res.data.map((stop) => stop.stop_name) });
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch all the stops");
    }
  },

  // ✅ Fetch buses between src & dst
  getAllSrcDstBus: async (data) => {
    try {
      const res = await axiosInstance.post("/booking/allBusSrc_dst", data);
      const busesWithDefaultTimes = res.data.map((bus) => ({
        ...bus,
        src_departure_time: bus.src_departure_time || "Not scheduled yet",
        dst_arrival_time: bus.dst_arrival_time || "Not scheduled yet",
      }));
      set({ srcdstbuses: busesWithDefaultTimes });
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch the buses between selected src and dst");
    }
  },

  // ✅ Fetch booked seats for a given segment
  getBookedSeats: async (selectedbus, selectedsrc, selecteddst, traveldate) => {
    try {
      const res = await axiosInstance.post(`/booking/bookedseats/${selectedbus}`, {
        src: selectedsrc,
        dst: selecteddst,
        travel_date: traveldate,
      });
      set({ bookedSeats: res.data.bookedSeats || [] });
    } catch (error) {
      console.error("Error fetching booked seats:", error);
      toast.error("Failed to fetch booked seats");
    }
  },

  // ✅ Book bus seat
  bookbus: async () => {
    try {
      const { selectedbus, selectedsrc, selecteddst, traveldate, selectedseat } = get();

      if (!selectedseat) {
        toast.error("Please select a seat before booking.");
        return;
      }

      const res = await axiosInstance.post(`/booking/bookbus/${selectedbus.bus_id}`, {
        src: selectedsrc,
        dst: selecteddst,
        travel_date: traveldate,
        seat_number: selectedseat,
      });

      set({ amount: res.data.amount_paid });
      toast.success("Seat booked successfully!");
      return true;
    } catch (error) {
      console.error("Error booking bus:", error);
      toast.error(error.response?.data?.message || "Booking failed");
      return false;
    }
  },

  // ✅ Fetch future bookings
  getUpcomingBookings: async () => {
    try {
      const res = await axiosInstance.get("/booking/bookbus");
      if (res.data.bookings) {
        set({ upcomingBookings: res.data.bookings });
      } else {
        set({ upcomingBookings: [] });
      }
    } catch (error) {
      console.error("Error fetching upcoming bookings:", error);
      toast.error("Failed to fetch upcoming bookings");
    }
  },

  // ✅ Fetch past bookings
  getPastBookings: async () => {
    try {
      const res = await axiosInstance.get("/booking/bookedbus");
      if (res.data.bookings) {
        set({ pastBookings: res.data.bookings });
      } else {
        set({ pastBookings: [] });
      }
    } catch (error) {
      console.error("Error fetching past bookings:", error);
      toast.error("Failed to fetch past bookings");
    }
  },
}));
