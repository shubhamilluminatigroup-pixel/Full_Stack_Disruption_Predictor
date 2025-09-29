import React from "react";

const DashboardButtons = ({
  loading,
  recalculating,
  fetchShipments,
  recalculateScores,
  fetchCoordinates,
  handleOptimizeRoutes,
  handleCheckDelays,
  fetchTrucks, // Added fetchTrucks prop
}) => {
  return (
    <div className="flex justify-center space-x-4 mb-6">
      <button
        onClick={fetchShipments}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow-lg transition duration-300 hover:scale-105 transform focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
      >
        {loading ? "Loading..." : "Fetch Shipments"}
      </button>
      <button
        onClick={recalculateScores}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow-lg transition duration-300 hover:scale-105 transform focus:outline-none focus:ring focus:ring-green-500 focus:ring-opacity-50"
      >
        {recalculating ? "Recalculating..." : "Recalculate Scores"}
      </button>
      <button
        onClick={fetchCoordinates}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded shadow-lg transition duration-300 hover:scale-105 transform focus:outline-none focus:ring focus:ring-purple-500 focus:ring-opacity-50"
      >
        {loading ? "Loading..." : "Fetch Coordinates"}
      </button>
      <button
        onClick={fetchTrucks} // New button to fetch trucks
        className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-2 rounded shadow-lg transition duration-300 hover:scale-105 transform focus:outline-none focus:ring focus:ring-yellow-500 focus:ring-opacity-50"
      >
        {loading ? "Loading..." : "Fetch Trucks"}
      </button>
      <button
        onClick={handleOptimizeRoutes}
        className="bg-white hover:bg-teal-700 text-black font-semibold px-6 py-2 rounded shadow-lg transition duration-300 hover:scale-105 transform focus:outline-none focus:ring focus:ring-teal-500 focus:ring-opacity-50"
      >
        {loading ? "Optimizing..." : "Optimize Routes"}
      </button>
      <button
        onClick={handleCheckDelays}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded shadow-lg transition duration-300 hover:scale-105 transform focus:outline-none focus:ring focus:ring-red-500 focus:ring-opacity-50"
      >
        {loading ? "Checking..." : "Check Delays"}
      </button>
    </div>
  );
};

export default DashboardButtons;
