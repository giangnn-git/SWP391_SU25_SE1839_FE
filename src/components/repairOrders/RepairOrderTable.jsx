import { useState } from "react";
import { Loader, AlertCircle, Wrench, UserCog } from "lucide-react";
import axios from "../../services/axios.customize";

const RepairOrderTable = ({ orders, loading, error, technicians = [] }) => {
    const [assigning, setAssigning] = useState(null);
    const [selectedTech, setSelectedTech] = useState("");

    const getProgressColor = (progress) => {
        if (progress >= 80) return "bg-green-100";
        if (progress >= 50) return "bg-blue-100";
        if (progress >= 25) return "bg-yellow-100";
        return "bg-gray-100";
    };

    const getProgressTextColor = (progress) => {
        if (progress >= 80) return "text-green-700";
        if (progress >= 50) return "text-blue-700";
        if (progress >= 25) return "text-yellow-700";
        return "text-gray-700";
    };

    const handleAssign = async (orderId) => {
        if (!selectedTech) return alert("Please select a technician.");
        try {
            setAssigning(orderId);
            await axios.put(`/api/repair-orders/${orderId}/assign`, {
                technician: selectedTech,
            });
            alert("Technician assigned successfully!");
            window.location.reload(); // refresh sau khi cập nhật
        } catch (err) {
            console.error(err);
            alert("Failed to assign technician.");
        } finally {
            setAssigning(null);
            setSelectedTech("");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
                <div className="text-center">
                    <Loader className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Loading repair orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                <div>
                    <h3 className="font-semibold text-red-900">Error Loading Data</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Wrench size={20} className="text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-900">Repair Orders</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                    {orders.length} {orders.length === 1 ? "order" : "orders"} in progress
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Model</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">VIN</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Year</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Technician</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Progress</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order.repairOrderId} className="hover:bg-blue-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        RO-{String(order.repairOrderId).padStart(3, "0")}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{order.modelName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">
                                        {order.vin}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{order.prodcutYear}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {order.techinal || "–"}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${getProgressColor(order.percentInProcess)}`}
                                                    style={{ width: `${order.percentInProcess}%` }}
                                                />
                                            </div>
                                            <span
                                                className={`text-sm font-semibold ${getProgressTextColor(order.percentInProcess)}`}
                                            >
                                                {order.percentInProcess}%
                                            </span>
                                        </div>
                                    </td>

                                    {/* Action: Assign Technician */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <select
                                                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                                                value={selectedTech}
                                                onChange={(e) => setSelectedTech(e.target.value)}
                                            >
                                                <option value="">Select Tech</option>
                                                {technicians.map((tech) => (
                                                    <option key={tech.id} value={tech.name}>
                                                        {tech.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleAssign(order.repairOrderId)}
                                                className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                                                disabled={assigning === order.repairOrderId}
                                            >
                                                <UserCog size={16} />
                                                {assigning === order.repairOrderId ? "Saving..." : "Assign"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Wrench className="text-gray-300" size={32} />
                                        <p className="text-gray-500 font-medium">No repair orders found</p>
                                        <p className="text-gray-400 text-sm">
                                            There are currently no repair orders to display
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RepairOrderTable;
