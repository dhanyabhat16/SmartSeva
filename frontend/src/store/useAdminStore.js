import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useAdminStore = create((set, get) => ({
  admin: null,
  isCheckingAdmin: true,
  isUpdatingAdminProfile: false,
  isFetchingAdmins: false,
  admins: [],
  routes:[],
  stops:[],
  routevars:[],
  buses:[],
  routebuses:[],
  payments:[],
  earn:null,


  getProfile: async () => {
    set({ isCheckingAdmin: true });
    try {
      const res = await axiosInstance.get("/auth/profile");
      set({ admin: res.data.profile });
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      set({ admin: null });
    } finally {
      set({ isCheckingAdmin: false });
    }
  },

  updateAdmin: async (updatedData) => {
    set({ isUpdatingAdminProfile: true });
    try {
      const res = await axiosInstance.put("/auth/admin-updateProfile", updatedData);
      set((state) => ({
        admin: { ...state.admin, ...updatedData },
      }));
    } catch (error) {
      console.error("Error updating admin profile:", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingAdminProfile: false });
    }
  },

  getAllAdmins: async () => {
    set({ isFetchingAdmins: true });
    try {
      const res = await axiosInstance.get("/admin/getAllAdmins");
      set({ admins: res.data });
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error(error.response?.data?.message || "Fetching admins failed");
    } finally {
      set({ isFetchingAdmins: false });
    }
  },

  addAdmin: async (data) => {
    try {
      const res = await axiosInstance.post("/admin/addAdmin", data);
      set((state) => ({
        admins: [...state.admins, res.data], // append the new admin
      }));
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error(error.response?.data?.message || "Adding admin failed");
    }
  },

    getAllRoute: async () => {
     try {
      const res = await axiosInstance.get("/bookbus/getAllRoutes");
      set({ routes: res.data });
      console.log(get().routes);
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.error(error.response?.data?.message || "Fetching routes failed");
    }
  },
    addRoute: async (data) => {
    try {
        const res = await axiosInstance.post("/admin/createRoute", data); // store response
        await get().getAllRoute();
    } catch (error) {
        console.error("Error adding route:", error);
        toast.error(error.response?.data?.message || "Adding route failed");
    }
    },
    delRoute:async (route_id) => {
    try {
        const res = await axiosInstance.delete(`/admin/deleteRoute/${route_id}`); 
        await get().getAllRoute();
    } catch (error) {
        console.error("Error deleting route:", error);
        toast.error(error.response?.data?.message || "deleting route failed");
    }
    },
    getAllStops: async () => {
     try {
      const res = await axiosInstance.get("/admin/getAllStops");
      set({ stops: res.data });
      console.log(get().stops);
    } catch (error) {
      console.error("Error fetching stops:", error);
      toast.error(error.response?.data?.message || "Fetching stops failed");
    }
  },
    addStop: async (data) => {
    try {
        const res = await axiosInstance.post("/admin/createStops", data); 
        await get().getAllStops();
    } catch (error) {
        console.error("Error adding stop:", error);
        toast.error(error.response?.data?.message || "Adding stop failed");
    }
    },
    delStop:async (stop_id) => {
    try {
        const res = await axiosInstance.delete(`/admin/deleteStops/${stop_id}`); 
        await get().getAllStops();
    } catch (error) {
        console.error("Error deleting stop:", error);
        toast.error(error.response?.data?.message || "deleting stop failed");
    }
    },
    editStop:async (stop_id,data) => {
    try {
        const res = await axiosInstance.put(`/admin/editStops/${stop_id}`,data); 
        await get().getAllStops();
    } catch (error) {
        console.error("Error editing stop:", error);
        toast.error(error.response?.data?.message || "editing stop failed");
    }
    },
    getAllVars: async (route_id) => {
     try {
      const res = await axiosInstance.get(`/bookbus/getAllRouteVariants/${route_id}`);
      set({ routevars: res.data.variants });
      console.log(get().routevars);
    } catch (error) {
      console.error("Error fetching variants:", error);
      toast.error(error.response?.data?.message || "Fetching variants failed");
    }
  },
    addVar: async (route_id,data) => {
    try {
        const res = await axiosInstance.post(`/admin/addRouteStops/${route_id}`, data); // store response
        await get().getAllVars(route_id);
    } catch (error) {
        console.error("Error adding variant:", error);
        toast.error(error.response?.data?.message || "Adding variant failed");
    }
    },
    delVar:async (route_id,variant_id) => {
    try {
        const res = await axiosInstance.delete(`/admin/deleteRouteVariant/${route_id}/${variant_id}`); 
        await get().getAllVars(route_id);
    } catch (error) {
        console.error("Error deleting variant:", error);
        toast.error(error.response?.data?.message || "deleting variant failed");
    }
    },
    editVar:async (route_id,variant_id,data) => {
    try {
        const res = await axiosInstance.put(`/admin/editRouteVariant/${route_id}/${variant_id}`,data); 
        await get().getAllVars(route_id);
    } catch (error) {
        console.error("Error editing variant:", error);
        toast.error(error.response?.data?.message || "editing variant failed");
    }
    },
    getAllBuses: async () => {
     try {
      const res = await axiosInstance.get("/bookbus/getAllBus");
      set({ buses: res.data });
      console.log(get().buses);
    } catch (error) {
      console.error("Error fetching buses:", error);
      toast.error(error.response?.data?.message || "Fetching buses failed");
    }
  },getAllRouteBuses: async (route_id) => {
     try {
      const res = await axiosInstance.get(`/bookbus/allrouteBus/${route_id}`);
      set({ routebuses: res.data.buses });
      console.log(get().routebuses);
    } catch (error) {
      console.error("Error fetching route buses:", error);
      toast.error(error.response?.data?.message || "Fetching route buses failed");
    }
  },
  addBus: async (data) => {
    console.log(data);
    try {
        const res = await axiosInstance.post("/admin/createBus", data); // store response
        await get().getAllBuses();
    } catch (error) {
        console.error("Error adding bus:", error);
        toast.error(error.response?.data?.message || "Adding bus failed");
    }
    },
    delBus:async (bus_id) => {
    try {
        const res = await axiosInstance.delete(`/admin/deleteBus/${bus_id}`); 
        await get().getAllBuses();
    } catch (error) {
        console.error("Error deleting bus:", error);
        toast.error(error.response?.data?.message || "deleting bus failed");
    }
    },
    addBusSch:async (bus_id,data) => {
    try {
        const res = await axiosInstance.post(`/admin/addBusSchedule/${bus_id}`, data); // store response
        await get().getAllBuses();
    } catch (error) {
        console.error("Error adding bus schedule:", error);
        toast.error(error.response?.data?.message || "Adding bus schedule failed");
    }
    },
    editBusSch:async (bus_id,data) => {
    try {
        const res = await axiosInstance.put(`/admin/editBusSchedule/${bus_id}`, data); // store response
        await get().getAllBuses();
    } catch (error) {
        console.error("Error editing bus schedule:", error);
        toast.error(error.response?.data?.message || "editing bus schedule failed");
    }
    },
    delBusSch:async (bus_id) => {
    try {
        const res = await axiosInstance.delete(`/admin/deleteBusSchedule/${bus_id}`); // store response
        await get().getAllBuses();
    } catch (error) {
        console.error("Error deleting bus schedule:", error);
        toast.error(error.response?.data?.message || "deleting bus schedule failed");
    }
    },
    payHist:async(days)=>{
        try {
        const res = await axiosInstance.post("/admin/payments",days); 
        set({payments:res.data.history});
        set({earn:res.data.earning});
    } catch (error) {
        console.error("Error fetching payment history:", error);
        toast.error(error.response?.data?.message || "failed to fetch payment history");
    }
    }
}));
