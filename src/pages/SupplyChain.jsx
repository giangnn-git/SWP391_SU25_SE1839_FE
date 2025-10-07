import React, { useState } from "react";
import { PlusCircle, Search, Warehouse } from "lucide-react";
import CreatePartModal from "../components/supply/CreatePartModal";
import DistributePartModal from "../components/supply/DistributePartModal";
import PartStatusTag from "../components/supply/PartStatusTag";

const dummyParts = [
    { id: 1, code: "BAT-001", name: "Battery Pack 48V", model: "EVM-A1", quantity: 6, location: "HCM Warehouse", status: "Low stock" },
    { id: 2, code: "INV-032", name: "Inverter Module", model: "EVM-A1", quantity: 24, location: "Hanoi Warehouse", status: "Available" },
    { id: 3, code: "BMS-004", name: "Battery Management System", model: "EVM-C2", quantity: 2, location: "Danang Warehouse", status: "Critical" },
    { id: 4, code: "MOT-020", name: "Motor Drive Unit", model: "EVM-B2", quantity: 18, location: "HCM Warehouse", status: "Available" },
];

const SupplyChain = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [parts, setParts] = useState(dummyParts);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDistributeModal, setShowDistributeModal] = useState(false);
    const [selectedPart, setSelectedPart] = useState(null);

    const filteredParts = parts.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Warehouse className="text-gray-800" size={26} />
                    <h1 className="text-2xl font-semibold">Supply Chain Management</h1>
                </div>

                <button
                    className="flex items-center bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md transition"
                    onClick={() => setShowAddModal(true)}
                >
                    <PlusCircle size={18} className="mr-2" />
                    Add New Part
                </button>
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-2 mb-4">
                <Search size={18} className="text-gray-500" />
                <input
                    type="text"
                    placeholder="Search by code, name, or model..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-gray-100 text-gray-900 text-left font-semibold">
                        <tr>
                            <th className="py-3 px-4">Part Code</th>
                            <th className="py-3 px-4">Part Name</th>
                            <th className="py-3 px-4">Model</th>
                            <th className="py-3 px-4 text-center">Quantity</th>
                            <th className="py-3 px-4">Warehouse Location</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredParts.map((part) => (
                            <tr
                                key={part.id}
                                className="border-t hover:bg-gray-50 transition-colors duration-100"
                            >
                                <td className="py-3 px-4 font-medium">{part.code}</td>
                                <td className="py-3 px-4">{part.name}</td>
                                <td className="py-3 px-4">{part.model}</td>
                                <td className="py-3 px-4 text-center">{part.quantity}</td>
                                <td className="py-3 px-4">{part.location}</td>
                                <td className="py-3 px-4">
                                    <PartStatusTag status={part.status} />
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button
                                        className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition"
                                        onClick={() => {
                                            setSelectedPart(part);
                                            setShowDistributeModal(true);
                                        }}
                                    >
                                        Distribute
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {filteredParts.length === 0 && (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="text-center py-6 text-gray-500 italic"
                                >
                                    No parts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {showAddModal && (
                <CreatePartModal onClose={() => setShowAddModal(false)} />
            )}

            {showDistributeModal && selectedPart && (
                <DistributePartModal
                    part={selectedPart}
                    onClose={() => setShowDistributeModal(false)}
                />
            )}
        </div>
    );
};

export default SupplyChain;
