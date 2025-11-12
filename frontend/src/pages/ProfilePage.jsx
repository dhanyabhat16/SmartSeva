import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import UpcomingBookings from "../components/UpcomingBookings.jsx";
import PastBookings from "../components/PastBookings.jsx";
import { Pencil, Check, X, Loader2 } from "lucide-react";

const ProfilePage = () => {
  const { authUser, updateUser, isUpdatingProfile } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: authUser?.name || "",
    age: authUser?.age || "",
  });

  const handleSave = async () => {
    await updateUser(editedUser);
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-base-200 py-10 px-6 flex flex-col gap-10 items-center">
      {/* --- Profile Info Card --- */}
      <div className="w-full max-w-3xl bg-base-100 shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-base-content mb-4 border-b pb-2 border-base-300">
          User Profile
        </h2>

        <div className="grid grid-cols-2 gap-4 text-base-content">
          {/* Name */}
          <div>
            <label className="font-medium">Name:</label>
            {editMode ? (
              <input
                type="text"
                value={editedUser.name}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, name: e.target.value })
                }
                className="w-full border rounded-lg px-2 py-1 mt-1 focus:outline-primary focus:ring-1 focus:ring-primary"
              />
            ) : (
              <p className="mt-1">{authUser?.name}</p>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="font-medium">Age:</label>
            {editMode ? (
              <input
                type="number"
                value={editedUser.age}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, age: e.target.value })
                }
                className="w-full border rounded-lg px-2 py-1 mt-1 focus:outline-primary focus:ring-1 focus:ring-primary"
              />
            ) : (
              <p className="mt-1">{authUser?.age}</p>
            )}
          </div>

          {/* Aadhaar */}
          <div>
            <label className="font-medium">Aadhaar:</label>
            <p className="mt-1">{authUser?.aadhaar || "Not provided"}</p>
          </div>

          {/* Username */}
          <div>
            <label className="font-medium">Username:</label>
            <p className="mt-1">{authUser?.username}</p>
          </div>

          {/* Ration Card */}
          {authUser?.ration_card && (
            <div className="col-span-2">
              <label className="font-medium">Ration Card:</label>
              <p className="mt-1">{authUser?.ration_card}</p>
            </div>
          )}
        </div>

        {/* --- Edit Buttons --- */}
        <div className="flex justify-end mt-4">
          {editMode ? (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isUpdatingProfile}
                className="btn btn-success gap-1 disabled:opacity-60"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} /> Save
                  </>
                )}
              </button>

              <button
                onClick={() => setEditMode(false)}
                disabled={isUpdatingProfile}
                className="btn btn-ghost gap-1 disabled:opacity-60"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="btn btn-primary gap-1"
            >
              <Pencil size={16} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* --- Bookings Section --- */}
      <div className="w-full max-w-5xl flex flex-col gap-8">
        <UpcomingBookings />
        <PastBookings />
      </div>
    </div>
  );
};

export default ProfilePage;
