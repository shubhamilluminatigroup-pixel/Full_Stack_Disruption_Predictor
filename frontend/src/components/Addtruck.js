import React, { useState } from "react";

const AddTruckForm = ({ API_BASE_URL, onTruckAdded }) => {
  const [formData, setFormData] = useState({
    registration_number: "",
    current_location_lat: "",
    current_location_lng: "",
    capacity_kg: "",
    available_volume_cubic_m: "",
    available_from: "",
    truck_type: "trailer", // Default value
    driver_contact: "",
    status: "available", // Default value
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    // Prepare the final payload, converting data types and handling empty strings
    const truckPayload = {
      ...formData,
      capacity_kg: formData.capacity_kg !== "" ? parseFloat(formData.capacity_kg) : 0,
      current_location_lat: formData.current_location_lat !== "" ? parseFloat(formData.current_location_lat) : null,
      current_location_lng: formData.current_location_lng !== "" ? parseFloat(formData.current_location_lng) : null,
      available_volume_cubic_m: formData.available_volume_cubic_m !== "" ? parseFloat(formData.available_volume_cubic_m) : null,
      available_from: formData.available_from !== "" ? new Date(formData.available_from).toISOString() : null,
    };

    // Remove empty strings and nulls for a cleaner payload, but keep falsy numbers (like 0)
    const requestBody = Object.entries(truckPayload).reduce((acc, [key, value]) => {
      if (value !== "" && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});

    try {
      console.log("Sending truck data: ", requestBody);
      const response = await fetch(`${API_BASE_URL}/shipments/singletruck/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add truck.");
      }

      const result = await response.json();
      setStatusMessage("Truck added successfully!");
      onTruckAdded();

      // Reset the form to initial state
      setFormData({
        registration_number: "",
        current_location_lat: "",
        current_location_lng: "",
        capacity_kg: "",
        available_volume_cubic_m: "",
        available_from: "",
        truck_type: "trailer",
        driver_contact: "",
        status: "available",
      });

    } catch (error) {
      console.error("Error adding truck:", error);
      setStatusMessage(`Failed to add truck: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputField = (label, name, type = "text", step, value, onChange, placeholder = "", isRequired = true) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1" htmlFor={name}>
        {label}
      </label>
      <input
        type={type}
        step={step}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={isRequired}
        placeholder={placeholder}
        className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
      />
    </div>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mt-6 text-white">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">Add New Truck</h2>
      {statusMessage && (
        <div className={`p-4 rounded-md mb-4 ${statusMessage.includes("successfully") ? "bg-green-600" : "bg-red-600"} text-white`}>
          {statusMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInputField("Registration Number", "registration_number", "text", null, formData.registration_number, handleInputChange)}
        {renderInputField("Capacity (kg)", "capacity_kg", "number", "0.01", formData.capacity_kg, handleInputChange)}
        {renderInputField("Current Location Latitude", "current_location_lat", "number", "any", formData.current_location_lat, handleInputChange, "", false)}
        {renderInputField("Current Location Longitude", "current_location_lng", "number", "any", formData.current_location_lng, handleInputChange, "", false)}
        {renderInputField("Available Volume (m³)", "available_volume_cubic_m", "number", "0.01", formData.available_volume_cubic_m, handleInputChange, "", false)}
        {renderInputField("Available From", "available_from", "datetime-local", null, formData.available_from, handleInputChange, "", false)}
        {renderInputField("Driver Contact", "driver_contact", "tel", null, formData.driver_contact, handleInputChange, "", false)}

        {/* Truck Type */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1" htmlFor="truck_type">Truck Type</label>
          <select id="truck_type" name="truck_type" value={formData.truck_type} onChange={handleInputChange} className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black">
            <option value="trailer">Trailer</option>
            <option value="refrigerated">Refrigerated</option>
            <option value="box">Box</option>
            <option value="flatbed">Flatbed</option>
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1" htmlFor="status">Status</label>
          <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black">
            <option value="available">Available</option>
            <option value="in_transit">In Transit</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="md:col-span-2 flex justify-center mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition duration-300 transform focus:outline-none focus:ring focus:ring-indigo-500 focus:ring-opacity-50 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {isSubmitting ? "Adding..." : "Add Truck"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTruckForm;