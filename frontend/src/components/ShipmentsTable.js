import React from "react";

const ShipmentsTable = ({ shipments, API_BASE_URL, onDeleteSuccess }) => {
  const handleDeleteShipment = async (shipmentId) => {
    // Show a confirmation dialog before proceeding
    const confirmed = window.confirm(
      `Are you sure you want to delete shipment ID: ${shipmentId}?`
    );

    if (!confirmed) {
      return; // User cancelled the deletion
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/shipments/${shipmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the shipment.");
      }

      // Call the callback function provided by the parent component
      // This will trigger a re-fetch of the shipment list
      onDeleteSuccess(shipmentId);
    } catch (error) {
      console.error("Error deleting shipment:", error);
      alert(`Failed to delete shipment: ${error.message}`);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-white-800 shadow-xl">
      <table className="min-w-full text-sm text-gray-300">
        <thead className="bg-gray-800 text-cyan-400">
          <tr>
            <th className="px-4 py-3 text-left">Sr. No.</th>
            <th className="px-4 py-3 text-left">Shipment ID</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Priority Score</th>
            <th className="px-4 py-3 text-left">Created At</th>
            <th className="px-4 py-3 text-left">Updated At</th>
            <th className="px-4 py-3 text-left">Shelf Life</th>
            <th className="px-4 py-3 text-left">Volume</th>
            <th className="px-4 py-3 text-left">Weight</th>
            <th className="px-4 py-3 text-left">Value</th>
            <th className="px-4 py-3 text-left">Origin Lat and long</th>
            <th className="px-4 py-3 text-left">Destination Lat and long</th>
            <th className="px-4 py-3 text-left">Origin</th>
            <th className="px-4 py-3 text-left">Destination</th>
            <th className="px-4 py-3 text-left">Vehicle ID</th>
            <th className="px-4 py-3 text-left">Actions</th> {/* New column for the delete button */}
          </tr>
        </thead>
        <tbody>
          {shipments.length === 0 ? (
            <tr>
              <td colSpan="16" className="text-center py-6 text-gray-500">
                No shipments available.
              </td>
            </tr>
          ) : (
            shipments.map((shipment, index) => (
              <tr
                key={index}
                className={"bg-gray-700 hover:bg-gray-800 transition duration-300"}
              >
                <td className="px-4 py-3 font-mono text-xs text-white">{index + 1}</td>
                <td className="px-4 py-3 font-mono text-xs">{shipment.shipment_id}</td>
                <td className="px-4 py-3">{shipment.shipment_status}</td>
                <td className="px-4 py-3 font-bold text-cyan-300">
                  {shipment.priority_score != null ? shipment.priority_score.toFixed(2) : "N/A"}
                </td>
                <td className="px-4 py-3 text-xs">
                  {new Date(shipment.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs">
                  {new Date(shipment.updated_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">{shipment.shelf_life_days} days</td>
                <td className="px-4 py-3">
                  {shipment.volume ? shipment.volume.toFixed(2) : "N/A"} m³
                </td>
                <td className="px-4 py-3">
                  {shipment.weight ? shipment.weight.toFixed(2) : "N/A"} kg
                </td>
                <td className="px-4 py-3">
                  {shipment.value ? shipment.value.toFixed(2) : "N/A"} $
                </td>
                <td className="px-4 py-3">
                  {shipment.origin_lat ? shipment.origin_lat.toFixed(4) : "1.0"},
                  {shipment.origin_long ? shipment.origin_long.toFixed(4) : "2.0"}
                </td>
                <td className="px-4 py-3">
                  {shipment.destination_lat ? shipment.destination_lat.toFixed(4) : "1.0"},
                  {shipment.destination_lng ? shipment.destination_lng.toFixed(4) : "2.0"}
                </td>
                <td className="px-4 py-3">
                  {shipment.origin_address?.city || "N/A"}
                </td>
                <td className="px-4 py-3">
                  {shipment.destination_address?.city || "N/A"}
                </td>
                <td className="px-4 py-3">{shipment.vehicle_id || "N/A"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDeleteShipment(shipment.shipment_id)}
                    className="text-red-500 hover:text-red-700 transition duration-300"
                    title="Delete Shipment"
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

export default ShipmentsTable;