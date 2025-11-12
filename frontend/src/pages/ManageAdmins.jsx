import React, { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { toast } from "react-hot-toast";

const ManageAdmins = () => {
  const { admins, getAllAdmins, addAdmin, isFetchingAdmins } = useAdminStore();
  const [newAdmin, setNewAdmin] = useState({ username: "", full_name: "", password: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getAllAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.username.trim() || !newAdmin.full_name.trim() || !newAdmin.password.trim()) {
      toast.error("All fields are required!");
      return;
    }
    await addAdmin(newAdmin);
    await getAllAdmins();
    setNewAdmin({ username: "", full_name: "", password: "" });
    setShowForm(false); // Hide form after adding
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-base-content">Manage Admins</h1>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="bg-green-600 text-base-100 px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {showForm ? "Close Form" : "Add New Admin"}
        </button>
      </div>

      {/* Collapsible Add Admin Form */}
      {showForm && (
        <div className="max-w-lg mx-auto mb-10 p-6 bg-base-100 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-primary">Add New Admin</h2>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block text-base-content mb-1">Username</label>
              <input
                type="text"
                value={newAdmin.username}
                onChange={(e) =>
                  setNewAdmin((prev) => ({ ...prev, username: e.target.value }))
                }
                className="w-full px-3 py-2 rounded border border-base-content/20 bg-base-100 text-base-content"
              />
            </div>
            <div>
              <label className="block text-base-content mb-1">Full Name</label>
              <input
                type="text"
                value={newAdmin.full_name}
                onChange={(e) =>
                  setNewAdmin((prev) => ({ ...prev, full_name: e.target.value }))
                }
                className="w-full px-3 py-2 rounded border border-base-content/20 bg-base-100 text-base-content"
              />
            </div>
            <div>
              <label className="block text-base-content mb-1">Password</label>
              <input
                type="password"
                value={newAdmin.password}
                onChange={(e) =>
                  setNewAdmin((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full px-3 py-2 rounded border border-base-content/20 bg-base-100 text-base-content"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded bg-primary text-primary-content font-semibold hover:bg-primary-focus transition"
            >
              Add Admin
            </button>
          </form>
        </div>
      )}

      {/* Admins List */}
      <h2 className="text-2xl font-semibold text-base-content mb-6 text-center">
        Existing Admins
      </h2>
      {isFetchingAdmins ? (
        <p className="text-base-content text-center">Loading admins...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {admins.map((admin) => (
            <div
              key={admin.admin_id}
              className="p-4 bg-base-100 rounded-xl shadow-md border border-base-content/20"
            >
              <p className="font-semibold text-base-content mb-1">
                Full Name: {admin.full_name}
              </p>
              <p className="text-base-content/80">Username: {admin.username}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageAdmins;
