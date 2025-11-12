import React, { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { toast } from "react-hot-toast";

const ManageBusSchedule = () => {
  const {
    buses,
    stops,
    getAllBuses,
    getAllStops,
    addBusSch,
    editBusSch,
    delBusSch,
  } = useAdminStore();

  const [selectedBus, setSelectedBus] = useState("");
  const [busDetails, setBusDetails] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch buses and stops initially
  useEffect(() => {
    getAllBuses();
    getAllStops();
  }, []);

  // Fetch selected bus details when bus changes
  useEffect(() => {
    if (!selectedBus) return;
    const bus = buses.find((b) => b.bus_id === parseInt(selectedBus));
    setBusDetails(bus);
    if (bus?.schedule && bus.schedule.length > 0) {
      setSchedule(bus.schedule);
      setIsEditing(true);
    } else {
      const newSchedule = stops.map((stop) => ({
        stop_id: stop.stop_id,
        stop_name: stop.stop_name,
        arrival_time: "",
        departure_time: "",
      }));
      setSchedule(newSchedule);
      setIsEditing(false);
    }
  }, [selectedBus, buses, stops]);

  const handleTimeChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const handleAddSchedule = async () => {
    try {
      const payload = {
        stop_schedules: schedule.map(({ stop_id, arrival_time, departure_time }) => ({
          stop_id,
          arrival_time,
          departure_time,
        })),
      };
      await addBusSch(selectedBus, payload);
      toast.success("Schedule added successfully!");
      setIsEditing(true);
    } catch (err) {
      toast.error("Failed to add schedule");
    }
  };

  const handleEditSchedule = async () => {
    try {
      const payload = {
        stop_schedules: schedule.map(({ stop_id, arrival_time, departure_time }) => ({
          stop_id,
          arrival_time,
          departure_time,
        })),
      };
      await editBusSch(selectedBus, payload);
      toast.success("Schedule updated successfully!");
    } catch (err) {
      toast.error("Failed to update schedule");
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      await delBusSch(selectedBus);
      toast.success("Schedule deleted successfully!");
      setSelectedBus("");
      setBusDetails(null);
      setSchedule([]);
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to delete schedule");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-5xl bg-card shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-foreground mb-6 text-center">
          Manage Bus Schedules
        </h1>

        {/* Select Bus */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4 mb-8">
          <select
            value={selectedBus}
            onChange={(e) => setSelectedBus(e.target.value)}
            className="border border-input bg-background text-foreground rounded-lg p-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a Bus</option>
            {buses.map((bus) => (
              <option key={bus.bus_id} value={bus.bus_id}>
                Bus #{bus.bus_id} — {bus.bus_name || "Unnamed"}
              </option>
            ))}
          </select>
        </div>

        {busDetails && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-foreground mb-2">
              Bus Details:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Bus Name:</span>{" "}
                {busDetails.bus_name || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-foreground">Bus Number:</span>{" "}
                {busDetails.bus_id || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-foreground">Capacity:</span>{" "}
                {busDetails.total_seats || "N/A"}
              </p>
            </div>
          </div>
        )}

        {/* Schedule Table */}
        {selectedBus && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-border rounded-lg">
              <thead className="bg-muted text-foreground">
                <tr>
                  
                  <th className="p-3 border border-border">Stop Name</th>
                  <th className="p-3 border border-border">Arrival Time</th>
                  <th className="p-3 border border-border">Departure Time</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((stop, index) => (
                  <tr key={stop.stop_id} className="text-center">
                    
                    <td className="p-3 border border-border">{stop.stop_name}</td>
                    <td className="p-3 border border-border">
                      <input
                        type="time"
                        value={stop.arrival_time}
                        onChange={(e) =>
                          handleTimeChange(index, "arrival_time", e.target.value)
                        }
                        className="border border-input bg-background text-foreground rounded-md p-1 w-32"
                      />
                    </td>
                    <td className="p-3 border border-border">
                      <input
                        type="time"
                        value={stop.departure_time}
                        onChange={(e) =>
                          handleTimeChange(index, "departure_time", e.target.value)
                        }
                        className="border border-input bg-background text-foreground rounded-md p-1 w-32"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Buttons */}
        {selectedBus && (
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {!isEditing ? (
              <button
                onClick={handleAddSchedule}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition"
              >
                Add Schedule
              </button>
            ) : (
              <>
                <button
                  onClick={handleEditSchedule}
                  className="bg-green-600 hover:bg-green-700 text-success-foreground px-6 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleDeleteSchedule}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Delete Schedule
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBusSchedule;
