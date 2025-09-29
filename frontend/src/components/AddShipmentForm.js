import React, { useState } from "react";

const AddShipmentForm = ({ API_BASE_URL, onShipmentAdded }) => {
  const [formData, setFormData] = useState({
    order_id: "",
    customer_id: "",
    origin_address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
    },
    destination_address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
    },
    value: "",
    weight: "",
    volume: "",
    shelf_life_days: "",
    delivery_date: "",
    shipment_type: "normal",
    regulatory_flags: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This handler correctly updates nested state for the address objects
  const handleAddressChange = (addressType, e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [name]: value,
      },
    }));
  };

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
    const shipmentPayload = {
      ...formData,
      value: formData.value !== "" ? parseFloat(formData.value) : 0,
      weight: formData.weight !== "" ? parseFloat(formData.weight) : 0,
      volume: formData.volume !== "" ? parseFloat(formData.volume) : 0,
      shelf_life_days: formData.shelf_life_days !== "" ? parseInt(formData.shelf_life_days, 10) : 0,
      regulatory_flags: formData.regulatory_flags.split(",").map(flag => flag.trim()).filter(flag => flag !== ""),
    };

    // MODIFIED: The API for a single shipment expects an object, not a list.
    // We now send the shipmentPayload object directly.
    const requestBody = shipmentPayload;

    try {
      console.log("Sending data: ", requestBody)  
      const response = await fetch(`${API_BASE_URL}/shipments/single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add shipment.");
      }

      const result = await response.json();
      setStatusMessage("Shipment added successfully!"); // Provide a clear success message
      onShipmentAdded();

      // Reset the form to initial state
      setFormData({
        order_id: "",
        customer_id: "",
        origin_address: { street: "", city: "", state: "", pincode: "", country: "" },
        destination_address: { street: "", city: "", state: "", pincode: "", country: "" },
        value: "",
        weight: "",
        volume: "",
        shelf_life_days: "",
        delivery_date: "",
        shipment_type: "normal",
        regulatory_flags: "",
      });

    } catch (error) {
      console.error("Error adding shipment:", error);
      console.log("formdata", formData);
      setStatusMessage(`Failed to add shipment: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputField = (label, name, type = "text", step, value, onChange, placeholder = "") => (
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
        required
        placeholder={placeholder}
        className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
      />
    </div>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mt-6 text-white">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">Add New Shipment</h2>
      {statusMessage && (
        <div className={`p-4 rounded-md mb-4 ${statusMessage.includes("successfully") ? "bg-green-600" : "bg-red-600"} text-white`}>
          {statusMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identifiers */}
        {renderInputField("Order ID", "order_id", "text", null, formData.order_id, handleInputChange)}
        {renderInputField("Customer ID", "customer_id", "text", null, formData.customer_id, handleInputChange)}

        {/* Origin Address */}
        <div className="md:col-span-2 space-y-2 p-4 border border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-200">Origin Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInputField("Street", "street", "text", null, formData.origin_address.street, (e) => handleAddressChange("origin_address", e))}
            {renderInputField("City", "city", "text", null, formData.origin_address.city, (e) => handleAddressChange("origin_address", e))}
            {renderInputField("State", "state", "text", null, formData.origin_address.state, (e) => handleAddressChange("origin_address", e))}
            {renderInputField("Pincode", "pincode", "text", null, formData.origin_address.pincode, (e) => handleAddressChange("origin_address", e))}
            {renderInputField("Country", "country", "text", null, formData.origin_address.country, (e) => handleAddressChange("origin_address", e))}
          </div>
        </div>

        {/* Destination Address */}
        <div className="md:col-span-2 space-y-2 p-4 border border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-200">Destination Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInputField("Street", "street", "text", null, formData.destination_address.street, (e) => handleAddressChange("destination_address", e))}
            {renderInputField("City", "city", "text", null, formData.destination_address.city, (e) => handleAddressChange("destination_address", e))}
            {renderInputField("State", "state", "text", null, formData.destination_address.state, (e) => handleAddressChange("destination_address", e))}
            {renderInputField("Pincode", "pincode", "text", null, formData.destination_address.pincode, (e) => handleAddressChange("destination_address", e))}
            {renderInputField("Country", "country", "text", null, formData.destination_address.country, (e) => handleAddressChange("destination_address", e))}
          </div>
        </div>

        {/* Shipment Details */}
        {renderInputField("Value", "value", "number", "0.01", formData.value, handleInputChange)}
        {renderInputField("Weight", "weight", "number", "0.01", formData.weight, handleInputChange)}
        {renderInputField("Volume", "volume", "number", "0.01", formData.volume, handleInputChange)}
        {renderInputField("Shelf Life (Days)", "shelf_life_days", "number", null, formData.shelf_life_days, handleInputChange)}
        {renderInputField("Delivery Date", "delivery_date", "date", null, formData.delivery_date, handleInputChange)}
        {/* Shipment Type */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1" htmlFor="shipment_type">Shipment Type</label>
          <select id="shipment_type" name="shipment_type" value={formData.shipment_type} onChange={handleInputChange} required className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black">
            <option value="normal">Normal</option>
            <option value="frozen">Frozen</option>
          </select>
        </div>
        {renderInputField("Regulatory Flags (comma separated)", "regulatory_flags", "text", null, formData.regulatory_flags, handleInputChange)}

        <div className="md:col-span-2 flex justify-center mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition duration-300 transform focus:outline-none focus:ring focus:ring-indigo-500 focus:ring-opacity-50 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {isSubmitting ? "Adding..." : "Add Shipment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddShipmentForm;