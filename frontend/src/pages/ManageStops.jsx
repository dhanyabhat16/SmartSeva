import React, { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { toast } from "react-hot-toast";

const ManageStops = () => {
  const { stops, getAllStops, addStop, delStop, editStop } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [newStop, setNewStop] = useState({ stop_name: "" });
  const [editingStopId, setEditingStopId] = useState(null);

  useEffect(() => {
    getAllStops();
  }, []);

  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!newStop.stop_name.trim()) {
      toast.error("Stop name cannot be empty!");
      return;
    }
    if (editingStopId) {
      await editStop(editingStopId, newStop);
      setEditingStopId(null);
    } else {
      await addStop(newStop);
    }
    setNewStop({ stop_name: "" });
    setShowForm(false);
  };

  const handleEdit = (stop) => {
    setNewStop({ stop_name: stop.stop_name });
    setEditingStopId(stop.stop_id);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-base-content">Manage Stops</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingStopId(null);
            setNewStop({ stop_name: "" });
          }}
          className="px-4 py-2 bg-success text-success-content rounded font-semibold hover:bg-success-focus transition"
        >
          {showForm ? "Cancel" : "Add New Stop"}
        </button>
      </div>

      {/* Add/Edit Stop Form */}
      {/* Add/Edit Stop Form */}
      {showForm && (
        <div className="max-w-lg mx-auto mb-10 p-6 bg-base-100 rounded-xl shadow-md">
          <form onSubmit={handleAddStop} className="space-y-4">
            <div>
              <label className="block text-base-content mb-1">
                {editingStopId ? "Update Stop Name" : "Stop Name"}
              </label>
              <input
                type="text"
                value={newStop.stop_name}
                onChange={(e) => setNewStop({ stop_name: e.target.value })}
                className="w-full px-3 py-2 rounded border border-base-content/20 bg-base-100 text-base-content"
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2 rounded font-semibold transition ${
                editingStopId
                  ? "bg-success text-success-content hover:bg-success-focus"
                  : "bg-primary text-primary-content hover:bg-primary-focus"
              }`}
            >
              {editingStopId ? "Update Stop Name" : "Add Stop"}
            </button>
          </form>
        </div>
      )}


      {/* Existing Stops List */}
      <h2 className="text-2xl font-semibold text-base-content mb-6 text-center">
        Existing Stops
      </h2>

      {stops.length === 0 ? (
        <p className="text-base-content text-center">No stops found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {stops.map((stop) => (
            <div
              key={stop.stop_id}
              className="p-4 bg-base-100 rounded-xl shadow-md border border-base-content/20 flex flex-col justify-between transform transition duration-300 hover:scale-105 hover:shadow-xl hover:border-primary"
            >
              <div className="mb-4">
                <p className="text-base-content font-semibold mb-1">
                  Stop Name: {stop.stop_name}
                </p>
                <p className="text-base-content/80">Stop ID: {stop.stop_id}</p>
              </div>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleEdit(stop)}
                  className="flex-1 py-2 border border-primary text-primary rounded font-semibold hover:bg-primary hover:text-primary-content transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => delStop(stop.stop_id)}
                  className="flex-1 py-2 border border-error text-error rounded font-semibold hover:bg-error hover:text-error-content transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageStops;
