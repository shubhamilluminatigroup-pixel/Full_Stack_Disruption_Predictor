import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RouteSummaryTable = ({ API_BASE_URL }) => {
    const [summaryData, setSummaryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummaryData = async () => {
            try {
                // Fetch truck and shipment data from your backend
                const [truckResponse, shipmentResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/Trucks/`),
                    axios.get(`${API_BASE_URL}/shipments/`)
                ]);

                const trucks = truckResponse.data;
                const shipments = shipmentResponse.data;

                // Create a map for quick truck lookup by ID
                const truckMap = trucks.reduce((map, truck) => {
                    map[truck.registration_number] = truck;
                    return map;
                }, {});

                // Group shipments by vehicle_id and aggregate data
                const groupedData = shipments.reduce((acc, shipment) => {
                    const vehicleId = shipment.vehicle_id;
                    if (vehicleId) {
                        if (!acc[vehicleId]) {
                            acc[vehicleId] = {
                                truck: truckMap[vehicleId] || { registration_number: 'N/A', capacity_kg: 0, available_volume_cubic_m: 0 },
                                totalWeight: 0,
                                totalVolume: 0,
                                shipmentIds: [],
                            };
                        }
                        acc[vehicleId].totalWeight += shipment.weight || 0;
                        acc[vehicleId].totalVolume += shipment.volume || 0;
                        acc[vehicleId].shipmentIds.push(shipment.destination_address.city);
                    }
                    return acc;
                }, {});

                // Convert grouped data into an array for rendering
                const summarizedData = Object.values(groupedData).map(data => {
                    const truck = data.truck;
                    const totalWeight = data.totalWeight;
                    const totalVolume = data.totalVolume;

                    const weightUtilization = (totalWeight / truck.capacity_kg) * 100;
                    const volumeUtilization = (totalVolume / truck.available_volume_cubic_m) * 100;

                    return {
                        truck: truck.registration_number,
                        shipments: data.shipmentIds.join(', '),
                        totalWeight: totalWeight.toFixed(2),
                        totalVolume: totalVolume.toFixed(2),
                        capacity_kg: truck.capacity_kg,
                        capacity_volume: truck.available_volume_cubic_m,
                        weightUtilization: isNaN(weightUtilization) || !isFinite(weightUtilization) ? '0.00%' : weightUtilization.toFixed(2) + '%',
                        volumeUtilization: isNaN(volumeUtilization) || !isFinite(volumeUtilization) ? '0.00%' : volumeUtilization.toFixed(2) + '%',
                    };
                });
                
                setSummaryData(summarizedData);
            } catch (err) {
                console.error("Error fetching or processing data:", err);
                setError("Failed to fetch data. Please check the backend API and ensure it's running.");
            } finally {
                setLoading(false);
            }
        };

        fetchSummaryData();
    }, [API_BASE_URL]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p className="ml-4 text-gray-700">Loading data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-800 shadow-xl p-4">
            <h2 className="text-xl font-bold mb-4 text-white">Route Summary</h2>
            <table className="min-w-full text-sm text-gray-300">
                <thead className="bg-gray-700 text-cyan-400">
                    <tr>
                        <th className="px-4 py-3 text-left">Truck</th>
                        <th className="px-4 py-3 text-left">Shipments</th>
                        <th className="px-4 py-3 text-right">Total Weight (kg)</th>
                        <th className="px-4 py-3 text-right">Total Volume (m³)</th>
                        <th className="px-4 py-3 text-right">Capacity (kg)</th>
                        <th className="px-4 py-3 text-right">Capacity (m³)</th>
                        <th className="px-4 py-3 text-right">Weight Utilization (%)</th>
                        <th className="px-4 py-3 text-right">Volume Utilization (%)</th>
                    </tr>
                </thead >
                <tbody className="bg-gray-800">
                    {summaryData.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="text-center py-6 text-gray-500">
                                No truck assignments found.
                            </td>
                        </tr>
                    ) : (
                        summaryData.map((data, index) => (
                            <tr
                                key={index}
                                className="border-t border-gray-700 hover:bg-gray-700 transition duration-300"
                            >
                                <td className="px-4 py-3 font-mono text-xs text-white">{data.truck}</td>
                                <td className="px-4 py-3">{data.shipments || 'N/A'}</td>
                                <td className="px-4 py-3 text-right">{data.totalWeight}</td>
                                <td className="px-4 py-3 text-right">{data.totalVolume}</td>
                                <td className="px-4 py-3 text-right">{data.capacity_kg}</td>
                                <td className="px-4 py-3 text-right">{data.capacity_volume}</td>
                                <td className="px-4 py-3 text-right">{data.weightUtilization}</td>
                                <td className="px-4 py-3 text-right">{data.volumeUtilization}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RouteSummaryTable;