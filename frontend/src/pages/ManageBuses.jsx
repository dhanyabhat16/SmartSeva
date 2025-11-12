import React, { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { toast } from "react-hot-toast";

const ManageBuses = () => {
  const {
    buses,
    routes,
    routevars,
    getAllBuses,
    getAllRoute,
    getAllVars,
    addBus,
    delBus,
  } = useAdminStore();

  const [filteredBuses, setFilteredBuses] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    bus_name: "",
    total_seats: "",
    route_id: "",
    variant_id: "",
  });

  // Fetch all routes and buses when component loads
  useEffect(() => {
    getAllRoute();
    getAllBuses();
  }, []);

  // Keep filteredBuses in sync with buses
  useEffect(() => {
    setFilteredBuses(buses);
  }, [buses]);

  // Filter buses when route or variant changes
  useEffect(() => {
    let result = buses;
    if (selectedRoute) {
      result = result.filter((bus) => bus.route_id === Number(selectedRoute));
    }
    if (selectedVariant) {
      result = result.filter(
        (bus) => bus.route_variant_id === Number(selectedVariant)
      );
    }
    setFilteredBuses(result);
  }, [selectedRoute, selectedVariant, buses]);

  // --- FILTER HANDLERS ---
  const handleRouteFilter = (routeId) => {
    setSelectedRoute(routeId);
    setSelectedVariant("");
    toast.success(routeId ? "Filtered by route" : "Showing all buses");
  };

  const handleVariantFilter = (variantId) => {
    setSelectedVariant(variantId);
    toast.success(variantId ? "Filtered by variant" : "Showing all buses");
  };

  // --- ADD BUS FORM ---
  const handleAddBusClick = () => {
    setShowForm((prev) => !prev);
    setForm({
      bus_name: "",
      total_seats: "",
      route_id: "",
      variant_id: "",
    });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRouteSelect = async (routeId) => {
    setForm({ ...form, route_id: routeId, variant_id: "" });
    if (routeId) await getAllVars(routeId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.bus_name.trim() ||
      !form.total_seats ||
      !form.route_id ||
      !form.variant_id
    ) {
      toast.error("All fields are required!");
      return;
    }

    try {
      await addBus(form);
      toast.success("Bus added successfully!");
      setShowForm(false);
      setForm({
        bus_name: "",
        total_seats: "",
        route_id: "",
        variant_id: "",
      });
    } catch (err) {
      toast.error("Failed to add bus");
    }
  };

  // --- DELETE BUS ---
  const handleDeleteBus = async (busId) => {
    if (!window.confirm("Are you sure you want to delete this bus?")) return;
    try {
      await delBus(busId);
      toast.success("Bus deleted successfully!");
    } catch {
      toast.error("Failed to delete bus");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-base-content">Manage Buses</h1>

        <div className="flex flex-wrap gap-4">
          {/* Route Filter */}
          <select
            className="select select-bordered bg-base-100 text-base-content"
            value={selectedRoute}
            onChange={(e) => handleRouteFilter(e.target.value)}
          >
            <option value="">All Routes</option>
            {routes.map((r) => (
              <option key={r.route_id} value={r.route_id}>
                {r.route_name}
              </option>
            ))}
          </select>

          {/* Variant Filter */}
          <select
            className="select select-bordered bg-base-100 text-base-content"
            value={selectedVariant}
            onChange={(e) => handleVariantFilter(e.target.value)}
          >
            <option value="">All Variants</option>
            {[...new Set(
              buses
                .filter(
                  (b) =>
                    selectedRoute === "" ||
                    b.route_id === Number(selectedRoute)
                )
                .map((b) => b.route_variant_id)
            )].map((variantId) => (
              <option key={variantId} value={variantId}>
                Variant {variantId}
              </option>
            ))}
          </select>

          {/* Add Bus Button */}
          <button
            onClick={handleAddBusClick}
            className="btn btn-success text-success-content"
          >
            {showForm ? "Cancel" : "+ Add Bus"}
          </button>
        </div>
      </div>

      {/* Add Bus Form */}
      {showForm && (
        <div className="max-w-2xl mx-auto mb-10 bg-base-100 p-6 rounded-xl shadow-md border border-base-content/20">
          <h2 className="text-xl font-semibold mb-4 text-center text-primary">
            Add New Bus
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Bus Name */}
            <div>
              <label className="block mb-1 text-base-content">Bus Name</label>
              <input
                type="text"
                name="bus_name"
                value={form.bus_name}
                onChange={handleFormChange}
                className="input input-bordered w-full bg-base-100 text-base-content"
                placeholder="Enter bus name"
              />
            </div>

            {/* Total Seats */}
            <div>
              <label className="block mb-1 text-base-content">Total Seats</label>
              <input
                type="number"
                name="total_seats"
                value={form.total_seats}
                onChange={handleFormChange}
                className="input input-bordered w-full bg-base-100 text-base-content"
                placeholder="Enter total seats"
              />
            </div>

            {/* Select Route */}
            <div>
              <label className="block mb-1 text-base-content">Select Route</label>
              <select
                name="route_id"
                value={form.route_id}
                onChange={(e) => handleRouteSelect(e.target.value)}
                className="select select-bordered w-full bg-base-100 text-base-content"
              >
                <option value="">Select Route</option>
                {routes.map((route) => (
                  <option key={route.route_id} value={route.route_id}>
                    {route.route_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Variant */}
            {form.route_id && (
              <div>
                <label className="block mb-1 text-base-content">
                  Select Variant (based on stops)
                </label>
                <select
                  name="variant_id"
                  value={form.variant_id}
                  onChange={handleFormChange}
                  className="select select-bordered w-full bg-base-100 text-base-content"
                >
                  <option value="">Select Variant</option>
                  {routevars.map((variant) => (
                    <option key={variant.variant_id} value={variant.variant_id}>
                      {variant.stops
                        ? variant.stops.split("_").join(" → ")
                        : `Variant ${variant.variant_id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full text-primary-content"
            >
              Add Bus
            </button>
          </form>
        </div>
      )}

      {/* Bus Display Section */}
      {filteredBuses.length === 0 ? (
        <p className="text-center text-base-content/70 text-lg">
          No buses found.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {filteredBuses.map((bus) => (
            <div
              key={bus.bus_id}
              className="bg-base-100 p-5 rounded-xl shadow-md border border-base-content/20 hover:shadow-xl hover:scale-105 transition-transform flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {bus.bus_name}
                </h3>
                <p className="text-base-content mb-1">
                  <span className="font-semibold">Bus ID:</span>{" "}
                  {bus.bus_id}
                </p>
                <p className="text-base-content mb-1">
                  <span className="font-semibold">Route:</span>{" "}
                  {bus.route_name}
                </p>
                <p className="text-base-content mb-1">
                  <span className="font-semibold">Total Seats:</span>{" "}
                  {bus.total_seats}
                </p>
                <p className="text-base-content mb-2">
                  <span className="font-semibold">Stops:</span>{" "}
                  {bus.stops
                    ? bus.stops.split("_").join(" → ")
                    : "No stops listed"}
                </p>

                {bus.schedule && bus.schedule.length > 0 ? (
                  <div className="mt-3 bg-base-200 rounded-lg p-3">
                    <h4 className="font-semibold mb-2 text-sm text-base-content">
                      Schedule:
                    </h4>
                    <div className="max-h-40 overflow-y-auto">
                      {bus.schedule.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm text-base-content/90 mb-1"
                        >
                          <span>{s.stop_name}</span>
                          <span>
                            {s.arrival_time.slice(0, 5)} -{" "}
                            {s.departure_time.slice(0, 5)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-base-content/60 italic mt-2">
                    No schedule available.
                  </p>
                )}
              </div>

              <button
                onClick={() => handleDeleteBus(bus.bus_id)}
                className="btn btn-error text-error-content mt-4 w-full"
              >
                Delete Bus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBuses;
