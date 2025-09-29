import React, { useState, useEffect } from "react";
import axios from "axios";
import ShipmentsTable from "./components/ShipmentsTable";
import TrucksTable from "./components/TrucksTable";
import DashboardButtons from "./components/DashboardButtons";
import WeightConfig from "./components/WeightConfig";
import DelayedShipments from "./components/DelayedShipments";
import AddShipmentForm from "./components/AddShipmentForm";
import AddTruckForm from "./components/Addtruck";
import RouteSummaryTable from "./components/milkrun table";


const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  const [shipments, setShipments] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [weights, setWeights] = useState({
    value: 0,
    weight: 0,
    volume: 0.25,
    shelf_life_days: 0.5,
    days_to_delivery: 0.5,
  });
  const [routes, setRoutes] = useState(null);
  const [delays, setDelays] = useState(null);
  const [activeTab, setActiveTab] = useState("shipments");

  const fetchShipments = () => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/shipments/`)
      .then((response) => {
        setShipments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching shipments:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchTrucks = () => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/Trucks/`)
      .then((response) => {
        setTrucks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching trucks:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const recalculateScores = () => {
    setRecalculating(true);
    axios
      .post(`${API_BASE_URL}/shipments/score/`)
      .then(() => fetchShipments())
      .catch((error) => {
        console.error("Error recalculating scores:", error);
      })
      .finally(() => {
        setRecalculating(false);
      });
  };

  const updateWeights = () => {
    axios
      .post(`${API_BASE_URL}/weights/fixed/`, weights)
      .then(() => alert("Weights updated successfully!"))
      .catch((error) => {
        console.error("Error updating weights:", error);
      });
  };


  const fetchCoordinates = () => {
    setLoading(true);
    axios
      .post(`${API_BASE_URL}/shipments/fill`)
      .then(() => fetchShipments())
      .catch((error) => {
        console.error("Error fetching coordinates:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleOptimizeRoutes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/optimize-routes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      setRoutes(data.optimized_routes);
    } catch (error) {
      console.error("Error optimizing routes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckDelays = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/delay/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      setDelays(data.shipment_delays);
      fetchShipments();
    } catch (error) {
      console.error("Error checking delays:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShipmentAdded = () => {
    console.log("Shipment added. Refresh logic can go here.");
    // You can add logic to refresh shipment list or show a toast
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWeights((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-3xl font-extrabold text-cyan-400 mb-6 text-center">
          🚀 Logistics Command Center
        </h1>

        <WeightConfig
          weights={weights}
          handleInputChange={handleInputChange}
          updateWeights={updateWeights}
        />

        <DashboardButtons
          loading={loading}
          recalculating={recalculating}
          fetchShipments={fetchShipments}
          recalculateScores={recalculateScores}
          fetchCoordinates={fetchCoordinates}
          handleOptimizeRoutes={handleOptimizeRoutes}
          handleCheckDelays={handleCheckDelays}
        />

        <div className="mb-6 border-b border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("shipments")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition duration-300 ${
                activeTab === "shipments"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-500"
              }`}
            >
              Shipments
            </button>
            <button
              onClick={() => {
                setActiveTab("trucks");
                fetchTrucks();
              }}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition duration-300 ${
                activeTab === "trucks"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-500"
              }`}
            >
              Trucks
            </button>
            <button
              onClick={() => setActiveTab("delays")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition duration-300 ${
                activeTab === "delays"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-500"
              }`}
            >
              Delayed Shipments
            </button>
            <button
              onClick={() => setActiveTab("milkrun")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition duration-300 ${
                activeTab === "milkrun"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-500"
              }`}
            >
              Milk run
            </button>

            <button
              onClick={() => setActiveTab("add")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition duration-300 ${
                activeTab === "add"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-500"
              }`}
            >
              Add Shipment
            </button>
            <button
              onClick={() => setActiveTab("addtruck")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition duration-300 ${
                activeTab === "addtruck"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:hover:border-gray-500"
              }`}
            >
              Add Truck
            </button>
            
          </nav>
        </div>

        {activeTab === "shipments" && <ShipmentsTable shipments={shipments} />}
        {activeTab === "trucks" && <TrucksTable trucks={trucks} loading={loading} />}
        {activeTab === "delays" && <DelayedShipments delays={shipments} />}
        {activeTab === "add" && <AddShipmentForm API_BASE_URL='http://127.0.0.1:8000' />}
        {activeTab === "addtruck" && <AddTruckForm API_BASE_URL='http://127.0.0.1:8000' />}
        {activeTab === "milkrun" && <RouteSummaryTable API_BASE_URL='http://127.0.0.1:8000' />}

      </div>
    </div>
  );
}

export default App;