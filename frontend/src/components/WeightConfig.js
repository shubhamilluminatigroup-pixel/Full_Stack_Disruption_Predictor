import React from "react";

const WeightConfig = ({ weights, handleInputChange, updateWeights }) => {
  const fields = ["value", "weight", "volume", "shelf_life_days", "days_to_delivery"];
  
  return (
    <>
      <div className="flex flex-wrap items-end gap-4 mb-4">
    {/* ... input fields ... */}
    {fields.map((field) => (
        <div key={field} className="flex-1 min-w-[100px]">
            <label className="block text-sm font-semibold text-white-400 mb-1 capitalize">
                {field.replace(/_/g, " ")}
            </label>
            <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                name={field}
                value={weights[field]}
                onChange={handleInputChange}
                className="w-full border border-gray-700 bg-gray-800 text-black-200 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-cyan-500 focus:border-cyan-500 transition duration-300"
            />
        </div>
    ))}

    {/* The button is now inside the same flex container */}
    <button
        onClick={updateWeights}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded shadow-lg transition duration-300 hover:scale-105 transform focus:outline-none focus:ring focus:ring-yellow-500 focus:ring-opacity-50"
    >
        Update Weights
    </button>
</div>
    </>
  );
};

export default WeightConfig;
