import React, { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ManageRoutes = () => {
  const { routes, getAllRoute, addRoute, delRoute } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [newRoute, setNewRoute] = useState({ route_name: "" });
  const navigate = useNavigate();

  useEffect(() => {
    getAllRoute();
  }, []);

  const handleAddRoute = async (e) => {
    e.preventDefault();
    if (!newRoute.route_name.trim()) {
      toast.error("Route name cannot be empty!");
      return;
    }
    await addRoute(newRoute);
    setNewRoute({ route_name: "" });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-base-content">Manage Routes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-success text-success-content rounded font-semibold hover:bg-success-focus transition"
        >
          {showForm ? "Cancel" : "Add New Route"}
        </button>
      </div>

      {/* Add Route Form */}
      {showForm && (
        <div className="max-w-lg mx-auto mb-10 p-6 bg-base-100 rounded-xl shadow-md">
          <form onSubmit={handleAddRoute} className="space-y-4">
            <div>
              <label className="block text-base-content mb-1">Route Name</label>
              <input
                type="text"
                value={newRoute.route_name}
                onChange={(e) =>
                  setNewRoute({ route_name: e.target.value })
                }
                className="w-full px-3 py-2 rounded border border-base-content/20 bg-base-100 text-base-content"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded bg-primary text-primary-content font-semibold hover:bg-primary-focus transition"
            >
              Add Route
            </button>
          </form>
        </div>
      )}

      {/* Existing Routes */}
      <h2 className="text-2xl font-semibold text-base-content mb-6 text-center">
        Existing Routes
      </h2>

      {routes.length === 0 ? (
        <p className="text-base-content text-center">No routes found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div
              key={route.route_id}
              className="p-4 bg-base-100 rounded-xl shadow-md border border-base-content/20 flex flex-col justify-between transform transition duration-300 hover:scale-105 hover:shadow-xl hover:border-primary"
            >
              <div className="mb-4">
                <p className="text-base-content font-semibold mb-1">
                  Route Name: {route.route_name}
                </p>
                <p className="text-base-content/80">
                  Route ID: {route.route_id}
                </p>
              </div>

              {/* Manage Route Way Button */}
              <button
                onClick={() => navigate(`/manage-routeWay/${route.route_id}`)}
                className="w-full py-2 mb-3 bg-success text-success-content rounded font-semibold hover:bg-success-focus transition"
              >
                Manage Route Way
              </button>

              {/* Delete Button */}
              <button
                onClick={() => delRoute(route.route_id)}
                className="w-full py-2 border border-error text-error rounded font-semibold hover:bg-error hover:text-error-content transition"
              >
                Delete Route
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageRoutes;
