import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAdminStore } from "../store/useAdminStore";
import { toast } from "react-hot-toast";

const ManageRouteWay = () => {
  const { route_id } = useParams();
  const {
    routevars,
    getAllVars,
    addVar,
    editVar,
    delVar,
    getAllStops,
    stops,
  } = useAdminStore();

  const [showModal, setShowModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [rows, setRows] = useState([{ stop_order: 1, stop_name: "" }]);
  const [filteredStops, setFilteredStops] = useState([]);
  const [activeRowIndex, setActiveRowIndex] = useState(null);

  useEffect(() => {
    getAllVars(route_id);
    getAllStops();
  }, [route_id]);

  const handleStopChange = (index, value) => {
    const updatedRows = [...rows];
    updatedRows[index].stop_name = value;
    setRows(updatedRows);

    if (value.trim() !== "") {
      const filtered = stops.filter((s) =>
        s.stop_name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStops(filtered);
    } else {
      setFilteredStops([]);
    }

    // Always keep one empty row at the end
    if (
      index === rows.length - 1 &&
      value.trim() !== "" &&
      !updatedRows.some((r) => r.stop_name === "")
    ) {
      setRows([...updatedRows, { stop_order: rows.length + 1, stop_name: "" }]);
    }
  };

  const handleSuggestionClick = (index, name) => {
    const updatedRows = [...rows];
    updatedRows[index].stop_name = name;
    setRows(updatedRows);
    setFilteredStops([]);
    setActiveRowIndex(null);
  };

  const handleSubmitVariant = async (e) => {
    e.preventDefault();

    const validRows = rows.filter((r) => r.stop_name.trim() !== "");
    if (validRows.length === 0) {
      toast.error("Please add at least one stop!");
      return;
    }

    try {
      const stopsPayload = validRows.map((r, i) => {
        const matched = stops.find(
          (s) => s.stop_name.toLowerCase() === r.stop_name.toLowerCase()
        );
        if (!matched) {
          toast.error(`Stop "${r.stop_name}" not found!`);
          throw new Error("Invalid stop name");
        }
        return { stop_id: matched.stop_id, stop_order: i + 1 };
      });

      const payload = { stops: stopsPayload };

      if (editingVariant) {
        await editVar(route_id, editingVariant.variant_id, payload);
        toast.success("Variant updated successfully!");
      } else {
        await addVar(route_id, payload);
        toast.success("Variant added successfully!");
      }

      setRows([{ stop_order: 1, stop_name: "" }]);
      setShowModal(false);
      setEditingVariant(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditVariant = (variant) => {
    // Split stops based on "_" for editing
    const parsedStops = variant.stops_readable
      .split("_")
      .map((name, i) => ({
        stop_order: i + 1,
        stop_name: name.trim(),
      }));

    // Add one empty row at the end for a new stop
    parsedStops.push({ stop_order: parsedStops.length + 1, stop_name: "" });

    setRows(parsedStops);
    setEditingVariant(variant);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-base-200 p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-base-content">
          Manage Route Variants (ID: {route_id})
        </h1>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingVariant(null);
            setRows([{ stop_order: 1, stop_name: "" }]);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition"
        >
          + Add Variant
        </button>
      </div>

      {/* Existing Variants */}
      <h2 className="text-2xl font-semibold text-center mb-6 text-base-content">
        Existing Variants
      </h2>

      {routevars.length === 0 ? (
        <p className="text-center text-base-content/70">
          No variants found for this route.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {routevars.map((variant, index) => (
            <div
              key={index}
              className="p-4 bg-base-100 rounded-xl shadow border border-base-content/20 hover:shadow-lg hover:scale-[1.02] transition-transform duration-200"
            >
              <p className="font-semibold text-base-content mb-2">
                Variant ID: {variant.variant_id}
              </p>
              <p className="text-base-content/70 mb-4">
                Stops:{" "}
                {variant.stops_readable
                  .split("_")
                  .map((s) => s.trim())
                  .join(" → ")}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditVariant(variant)}
                  className="flex-1 py-2 border border-blue-500 text-blue-500 rounded font-semibold hover:bg-blue-500 hover:text-white transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => delVar(route_id, variant.variant_id)}
                  className="flex-1 py-2 border border-error text-error rounded font-semibold hover:bg-error hover:text-error-content transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Variant Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-base-100 rounded-xl shadow-lg p-6 w-full max-w-3xl relative">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              {editingVariant ? "Edit Route Variant" : "Add New Route Variant"}
            </h2>

            <form onSubmit={handleSubmitVariant}>
              <table className="table w-full mb-4 border">
                <thead>
                  <tr className="bg-base-200">
                    <th>Stop Order</th>
                    <th>Stop Name</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td className="text-center">{row.stop_order}</td>
                      <td className="relative">
                        <input
                          type="text"
                          value={row.stop_name}
                          onFocus={() => setActiveRowIndex(index)}
                          onChange={(e) =>
                            handleStopChange(index, e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded bg-base-100 text-base-content focus:ring-2 focus:ring-green-400 outline-none"
                          placeholder="Enter stop name"
                        />
                        {filteredStops.length > 0 &&
                          row.stop_name.trim() !== "" &&
                          activeRowIndex === index && (
                            <ul className="absolute z-20 bg-white border border-gray-300 rounded-md mt-1 w-full shadow-lg max-h-48 overflow-y-auto">
                              {filteredStops.map((s) => (
                                <li
                                  key={s.stop_id}
                                  onClick={() =>
                                    handleSuggestionClick(index, s.stop_name)
                                  }
                                  className="px-3 py-2 hover:bg-green-100 cursor-pointer transition-colors"
                                >
                                  {s.stop_name}
                                </li>
                              ))}
                            </ul>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVariant(null);
                  }}
                  className="px-4 py-2 border rounded font-semibold hover:bg-base-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded font-semibold text-white ${
                    editingVariant
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {editingVariant ? "Update Variant" : "Add This Variant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRouteWay;
