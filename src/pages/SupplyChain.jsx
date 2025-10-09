import React, { useState } from "react";
import { PlusCircle, Search, Warehouse, Pencil, Trash2 } from "lucide-react";
import CreatePartModal from "../components/supply/CreatePartModal";
import DistributePartModal from "../components/supply/DistributePartModal";
import PartStatusTag from "../components/supply/PartStatusTag";

const initialParts = [
    { id: 1, code: "BAT-001", name: "Battery Pack 48V", model: "EVM-A1", quantity: 6, location: "HCM Warehouse", status: "Low stock" },
    { id: 2, code: "INV-032", name: "Inverter Module", model: "EVM-A1", quantity: 24, location: "Hanoi Warehouse", status: "Available" },
    { id: 3, code: "BMS-004", name: "Battery Management System", model: "EVM-C2", quantity: 2, location: "Danang Warehouse", status: "Critical" },
    { id: 4, code: "MOT-020", name: "Motor Drive Unit", model: "EVM-B2", quantity: 18, location: "HCM Warehouse", status: "Available" },
];

const SupplyChain = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [parts, setParts] = useState(initialParts);
    const [selectedPart, setSelectedPart] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDistributeModal, setShowDistributeModal] = useState(false);

    // Filter parts by search term
    const filteredParts = parts.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle Add Part
    const handleAddPart = (newPart) => {
        setParts([...parts, { ...newPart, id: Date.now() }]);
        setShowAddModal(false);
    };

    // Handle Edit Part
    const handleEditPart = (updatedPart) => {
        setParts(parts.map((p) => (p.id === updatedPart.id ? updatedPart : p)));
        setShowEditModal(false);
        setSelectedPart(null);
    };

    // Handle Delete Part
    const handleDeletePart = (id) => {
        if (window.confirm("Are you sure you want to delete this part?")) {
            setParts(parts.filter((p) => p.id !== id));
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <Warehouse size={26} className="text-gray-800" />
                        <h1 className="text-2xl font-semibold">Supply Chain Management</h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage part stock and distribution across service centers
                    </p>
                </div>

                <button
                    className="flex items-center bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md transition-all shadow-sm"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                <table className="min-w-full text-sm text-gray-700 border-separate border-spacing-y-1">
                    <thead className="bg-gray-100 text-gray-900 font-semibold">
                        <tr>
                            <th className="py-3 px-4 text-left">Part Code</th>
                            <th className="py-3 px-4 text-left">Part Name</th>
                            <th className="py-3 px-4 text-left">Model</th>
                            <th className="py-3 px-4 text-center">Quantity</th>
                            <th className="py-3 px-4 text-left">Warehouse</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredParts.map((part) => (
                            <tr
                                key={part.id}
                                className="bg-white border border-gray-200 hover:shadow-sm transition duration-100"
                            >
                                <td className="py-3 px-4 font-medium">{part.code}</td>
                                <td className="py-3 px-4">{part.name}</td>
                                <td className="py-3 px-4">{part.model}</td>
                                <td className="py-3 px-4 text-center">{part.quantity}</td>
                                <td className="py-3 px-4">{part.location}</td>
                                <td className="py-3 px-4">
                                    <PartStatusTag status={part.status} />
                                </td>

                                <td className="py-3 px-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            className="flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition text-sm shadow-sm"
                                            onClick={() => {
                                                setSelectedPart(part);
                                                setShowDistributeModal(true);
                                            }}
                                        >
                                            🚚 Distribute
                                        </button>
                                        <button
                                            className="flex items-center gap-1 bg-blue-600 text-white px-2.5 py-1.5 rounded-md hover:bg-blue-700 transition text-sm shadow-sm"
                                            onClick={() => {
                                                setSelectedPart(part);
                                                setShowEditModal(true);
                                            }}
                                        >
                                            <Pencil size={14} /> Edit
                                        </button>
                                        <button
                                            className="flex items-center gap-1 bg-red-500 text-white px-2.5 py-1.5 rounded-md hover:bg-red-600 transition text-sm shadow-sm"
                                            onClick={() => handleDeletePart(part.id)}
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
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
                <CreatePartModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddPart}
                />
            )}

            {showEditModal && selectedPart && (
                <CreatePartModal
                    editMode
                    part={selectedPart}
                    onClose={() => setShowEditModal(false)}
                    onSubmit={handleEditPart}
                />
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
