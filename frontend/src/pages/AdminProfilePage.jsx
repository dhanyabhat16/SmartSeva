import React, { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { toast } from "react-hot-toast";

const AdminProfilePage = () => {
  const { admin, getProfile, updateAdmin, isUpdatingAdminProfile, isCheckingAdmin } = useAdminStore();
  const [fullName, setFullName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    if (admin) setFullName(admin.full_name || "");
  }, [admin]);

  const handleUpdate = async () => {
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty!");
      return;
    }
    await updateAdmin({ name: fullName });
    setIsEditing(false); // disable editing after update
    await getProfile();
  };

  if (isCheckingAdmin) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-100">
        <p className="text-base-content">Loading profile...</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-100">
        <p className="text-error">Admin not found!</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 rounded-lg shadow-lg bg-base-200">
      <h2 className="text-2xl font-semibold text-primary mb-6">Admin Profile</h2>

      <div className="mb-4">
        <label className="block text-base-content mb-1">Username</label>
        <input
          type="text"
          value={admin.username}
          disabled
          className="w-full px-3 py-2 rounded border border-base-content/20 bg-base-100 text-base-content"
        />
      </div>

      <div className="mb-4">
        <label className="block text-base-content mb-1">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={!isEditing} // editable only when isEditing is true
          className={`w-full px-3 py-2 rounded border ${
            isEditing ? "border-primary" : "border-base-content/20"
          } bg-base-100 text-base-content`}
        />
      </div>

      {/* Edit Button */}
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full mb-3 py-2 rounded font-semibold bg-success text-success-content hover:bg-success-focus"
        >
          Edit Name
        </button>
      )}

      {/* Update Profile Button */}
      {isEditing && (
        <button
          onClick={handleUpdate}
          disabled={isUpdatingAdminProfile}
          className={`w-full py-2 rounded font-semibold ${
            isUpdatingAdminProfile
              ? "bg-primary-focus cursor-not-allowed text-primary-content"
              : "bg-primary text-primary-content hover:bg-primary-focus"
          }`}
        >
          {isUpdatingAdminProfile ? "Updating..." : "Update Profile"}
        </button>
      )}
    </div>
  );
};

export default AdminProfilePage;
