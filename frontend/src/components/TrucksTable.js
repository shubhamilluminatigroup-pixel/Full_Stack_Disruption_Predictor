import React from "react";

const TrucksTable = ({ trucks, loading, API_BASE_URL, onDeleteSuccess }) => {
  const handleDeleteTruck = async (truck_id) => {
    // Show a confirmation dialog before proceeding
    const confirmed = window.confirm(
      `Are you sure you want to delete truck with registration number: ${truck_id}?`
    );

    if (!confirmed) {
      return; // User cancelled the deletion
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/Trucks/${truck_id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete the truck.");
      }

      // Call the callback function from the parent to update the UI
      onDeleteSuccess(truck_id);
    } catch (error) {
      console.error("Error deleting truck:", error);
      alert(`Failed to delete truck: ${error.message}`);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-800 shadow-xl">
      <table className="min-w-full text-sm text-gray-300">
        <thead className="bg-gray-800 text-cyan-400">
          <tr>
            <th className="px-4 py-3 text-left">Truck ID</th>
            <th className="px-4 py-3 text-left">Registration Number</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Current Location</th>
            <th className="px-4 py-3 text-left">Capacity (Weight)</th>
            <th className="px-4 py-3 text-left">Capacity (Volume)</th>
            <th className="px-4 py-3 text-left">shipments (Volume)</th>
            <th className="px-4 py-3 text-left">Last Updated</th>
            <th className="px-4 py-3 text-left">Actions</th> {/* New column for actions */}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="text-center py-6 text-gray-500">
                Loading truck data...
              </td>
            </tr>
          ) : trucks.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-6 text-gray-500">
                No truck data available.
              </td>
            </tr>
          ) : (
            trucks.map((truck, index) => (
              <tr
                key={index}
                className={"bg-gray-700 hover:bg-gray-800 transition duration-300"}
              >
                <td className="px-4 py-3 font-mono text-xs">{truck.truck_id}</td>
                <td className="px-4 py-3 font-mono text-xs">{truck.registration_number}</td>
                <td className="px-4 py-3">{truck.status}</td>
                <td className="px-4 py-3">
                  {truck.current_location_lat != null && truck.current_location_lng != null
                    ? `${truck.current_location_lat.toFixed(4)}, ${truck.current_location_lng.toFixed(4)}`
                    : "N/A"}
                </td>
                <td className="px-4 py-3">{truck.capacity_kg || "N/A"} kg</td>
                <td className="px-4 py-3">{truck.available_volume_cubic_m || "N/A"} m³</td>
                <td className="px-4 py-3">{truck.shipment_ids || "N/A"} </td>
                <td className="px-4 py-3 text-xs">
                  {new Date(truck.last_updated).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDeleteTruck(truck.truck_id)}
                    className="text-red-500 hover:text-red-700 transition duration-300"
                    title="Delete Truck"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.942a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .598.046-.046A48.243 48.243 0 0 0 12 10.518c2.312 0 4.502-.14 6.643-.393m-12.008 3.51a3.75 3.75 0 1 0 7.5 0"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TrucksTable;