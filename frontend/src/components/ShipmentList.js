import React, { useEffect, useState } from "react";
import axios from "axios";

const ShipmentList = () => {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/shipments/") // Adjust port if different
      .then(res => setShipments(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Shipment List</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Shipment ID</th>
              <th className="px-4 py-2">Customer ID</th>
              <th className="px-4 py-2">Origin</th>
              <th className="px-4 py-2">Destination</th>
              <th className="px-4 py-2">Value</th>
              <th className="px-4 py-2">Weight</th>
              <th className="px-4 py-2">Shelf Life</th>
              <th className="px-4 py-2">Delivery</th>
              <th className="px-4 py-2">Priority</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.shipment_id} className="border-t">
                <td className="px-4 py-2">{s.shipment_id}</td>
                <td className="px-4 py-2">{s.customer_id}</td>
                <td className="px-4 py-2">{s.origin_address?.city}</td>
                <td className="px-4 py-2">{s.destination_address?.city}</td>
                <td className="px-4 py-2">{s.value}</td>
                <td className="px-4 py-2">{s.weight}</td>
                <td className="px-4 py-2">{s.shelf_life_days} days</td>
                <td className="px-4 py-2">{s.delivery_date}</td>
                <td className="px-4 py-2">{s.priority_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShipmentList;
