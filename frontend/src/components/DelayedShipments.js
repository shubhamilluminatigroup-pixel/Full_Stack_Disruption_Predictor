import React from "react";

const DelayedShipments = ({ delays }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-800 shadow-xl">
      <h2 className="text-xl font-bold p-4 text-gray-200">Shipment Delays</h2>
      <table className="min-w-full text-sm text-gray-300">
        <thead className="bg-red-900 text-white">
          <tr>
            <th className="px-4 py-3 text-left">Sr. No.</th>
            <th className="px-4 py-3 text-left">Shipment ID</th>
            <th className="px-4 py-3 text-left">Delay Reason</th>
            <th className="px-4 py-3 text-left">Possible Delay</th>
            <th className="px-4 py-3 text-left">Normal SLA</th>
            <th className="px-4 py-3 text-left">ETA</th>
            <th className="px-4 py-3 text-left">Origin</th>
            <th className="px-4 py-3 text-left">Destination</th>
          </tr>
        </thead>
        <tbody>
          {!delays || delays.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                No delays reported or data not yet checked.
              </td>
            </tr>
          ) : (
            delays.map((delay, index) => {
              // Parse the JSON string from the regulatory_flags variable
              let parsedData = {};
              try {
                parsedData = JSON.parse(delay.regulatory_flags);
              } catch (e) {
                console.error("Failed to parse regulatory_flags JSON string:", e);
              }

              return (
                <tr
                  key={index}
                  className={
                    "bg-gray-700 hover:bg-gray-800 transition duration-300"
                  }
                >
                  <td className="px-4 py-3 font-mono text-xs text-red-300">{index + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-red-300">{delay.shipment_id}</td>
                  <td className="px-4 py-3">{parsedData.possible_delay_reason}</td>
                  <td className="px-4 py-3">{parsedData.estimated_delay_hours}</td>
                  <td className="px-4 py-3">{parsedData.normal_duration_hours}</td>
                  <td className="px-4 py-3">{parsedData.expected_duration_hours}</td>
                  <td className="px-4 py-3">{delay.origin_address?.city || "N/A"}</td>
                  <td className="px-4 py-3">{delay.destination_address?.city || "N/A"}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DelayedShipments;