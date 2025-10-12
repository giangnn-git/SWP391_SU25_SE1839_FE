import React, { useState } from "react";
import { PlusCircle, Search, Warehouse, Filter, Eye, Truck } from "lucide-react";
import CreatePartModal from "../components/supply/CreatePartModal";
import DistributePartModal from "../components/supply/DistributePartModal";
import PartStatusTag from "../components/supply/PartStatusTag";
import ViewPartModal from "../components/supply/ViewPartModal"; // ✅ modal xem chi tiết

const initialParts = [
    { id: 1, code: "BAT-001", name: "Battery Pack 48V", model: "EVM-A1", quantity: 6, location: "HCM Warehouse", status: "Low stock" },
    { id: 2, code: "INV-032", name: "Inverter Module", model: "EVM-A1", quantity: 24, location: "Hanoi Warehouse", status: "Available" },
    { id: 3, code: "BMS-004", name: "Battery Management System", model: "EVM-C2", quantity: 2, location: "Danang Warehouse", status: "Critical" },
    { id: 4, code: "MOT-020", name: "Motor Drive Unit", model: "EVM-B2", quantity: 18, location: "HCM Warehouse", status: "Available" },
    { id: 5, code: "CHG-015", name: "Charging Module", model: "EVM-A2", quantity: 12, location: "Hanoi Warehouse", status: "Available" },
    { id: 6, code: "BMS-009", name: "Battery Management System", model: "EVM-B1", quantity: 3, location: "HCM Warehouse", status: "Low stock" },
    { id: 7, code: "MOT-025", name: "Motor Drive Unit", model: "EVM-C3", quantity: 1, location: "Danang Warehouse", status: "Critical" },
    { id: 8, code: "INV-100", name: "Inverter Module", model: "EVM-D1", quantity: 30, location: "HCM Warehouse", status: "Available" },
];

const SupplyChain = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterWarehouse, setFilterWarehouse] = useState("");
    const [parts, setParts] = useState(initialParts);
    const [selectedPart, setSelectedPart] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDistributeModal, setShowDistributeModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false); // ✅ modal xem chi tiết

    // ✅ Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // ✅ Filter + Search
    const filteredParts = parts.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.model.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus ? p.status === filterStatus : true;
        const matchesWarehouse = filterWarehouse ? p.location === filterWarehouse : true;
        return matchesSearch && matchesStatus && matchesWarehouse;
    });

    // ✅ Pagination logic
    const totalPages = Math.ceil(filteredParts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentParts = filteredParts.slice(startIndex, startIndex + itemsPerPage);

    const uniqueStatuses = [...new Set(parts.map((p) => p.status))];
    const uniqueWarehouses = [...new Set(parts.map((p) => p.location))];

    // ✅ Add new part
    const handleAddPart = (newPart) => {
        setParts([...parts, { ...newPart, id: Date.now() }]);
        setShowAddModal(false);
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

            {/* Search & Filter Bar */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3 text-gray-700 font-medium">
                    <Filter size={18} className="text-gray-600" />

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                        <option value="">All Status</option>
                        {uniqueStatuses.map((status, index) => (
                            <option key={index} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filterWarehouse}
                        onChange={(e) => setFilterWarehouse(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                        <option value="">All Warehouses</option>
                        {uniqueWarehouses.map((warehouse, index) => (
                            <option key={index} value={warehouse}>
                                {warehouse}
                            </option>
                        ))}
                    </select>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by code, name, or model..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
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
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentParts.map((part) => (
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

                                {/* ✅ Only View + Distribute buttons */}
                                <td className="py-3 px-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            className="flex items-center justify-center w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                                            title="View details"
                                            onClick={() => {
                                                setSelectedPart(part);
                                                setShowViewModal(true);
                                            }}
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedPart(part);
                                                setShowDistributeModal(true);
                                            }}
                                            className="flex items-center justify-center w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                                            title="Distribute part"
                                        >
                                            <Truck size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {currentParts.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center py-6 text-gray-500 italic">
                                    No parts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ✅ Pagination */}
            {filteredParts.length > 0 && (
                <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                    <span>
                        Showing {startIndex + 1}–
                        {Math.min(startIndex + itemsPerPage, filteredParts.length)} of{" "}
                        {filteredParts.length} parts
                    </span>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Prev
                        </button>
                        <span className="px-2 font-medium">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <button
                            className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showAddModal && (
                <CreatePartModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddPart}
                />
            )}

            {showDistributeModal && selectedPart && (
                <DistributePartModal
                    part={selectedPart}
                    onClose={() => setShowDistributeModal(false)}
                />
            )}

            {showViewModal && selectedPart && (
                <ViewPartModal
                    part={selectedPart}
                    onClose={() => setShowViewModal(false)}
                />
            )}
        </div>
    );
};

export default SupplyChain;
