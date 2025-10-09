import React, { useState } from "react";
import { PlusCircle, Filter, Eye } from "lucide-react";

// ✅ Dummy data mẫu
const dummyWarrantyPolicies = [
    {
        name: "Standard Battery Warranty",
        description: "Covers battery and inverter for standard EV models.",
        durationPeriod: "24 months",
        mileageLimit: "40,000 km",
    },
    {
        name: "Full Vehicle Protection",
        description: "Includes all electric components, frame, and control unit.",
        durationPeriod: "36 months",
        mileageLimit: "60,000 km",
    },
    {
        name: "Motor & Controller Policy",
        description: "Protects motor drive and controller components.",
        durationPeriod: "18 months",
        mileageLimit: "30,000 km",
    },
    {
        name: "Premium Long-Term Coverage",
        description: "Extended protection plan for premium customers.",
        durationPeriod: "48 months",
        mileageLimit: "80,000 km",
    },
];

const WarrantyPolicyManagement = () => {
    const [policies, setPolicies] = useState(dummyWarrantyPolicies);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [selectedPolicy, setSelectedPolicy] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        durationPeriod: "",
        mileageLimit: "",
    });

    // ✅ Filter & Pagination
    const [filterDuration, setFilterDuration] = useState("");
    const [filterMileage, setFilterMileage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // ✅ Filter logic
    const filteredPolicies = policies.filter((p) => {
        const matchDuration = filterDuration
            ? p.durationPeriod === filterDuration
            : true;
        const matchMileage = filterMileage ? p.mileageLimit === filterMileage : true;
        return matchDuration && matchMileage;
    });

    // ✅ Pagination logic
    const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPolicies = filteredPolicies.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    // ✅ CRUD handlers
    const handleSave = () => {
        const { name, description, durationPeriod, mileageLimit } = formData;
        if (!name || !description || !durationPeriod || !mileageLimit) {
            alert("Please fill in all fields before saving.");
            return;
        }

        if (editing) {
            setPolicies(
                policies.map((p) =>
                    p.name === editing.name ? { ...p, ...formData } : p
                )
            );
        } else {
            setPolicies([...policies, { ...formData }]);
        }

        setShowModal(false);
        setEditing(null);
        setFormData({
            name: "",
            description: "",
            durationPeriod: "",
            mileageLimit: "",
        });
    };

    const handleDelete = (name) => {
        if (window.confirm("Are you sure you want to delete this warranty policy?")) {
            setPolicies(policies.filter((p) => p.name !== name));
        }
    };

    // ✅ Handle View
    const handleView = (policy) => {
        setSelectedPolicy(policy);
        setShowViewModal(true);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    🛡️ Warranty Policy Management
                </h2>
                <button
                    className="flex items-center bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md transition shadow-sm"
                    onClick={() => setShowModal(true)}
                >
                    <PlusCircle size={18} className="mr-2" />
                    Add New Warranty Policy
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3 text-gray-700 font-medium">
                    <Filter size={18} className="text-gray-600" />
                    <select
                        value={filterDuration}
                        onChange={(e) => setFilterDuration(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                        <option value="">All Duration Periods</option>
                        {[...new Set(policies.map((p) => p.durationPeriod))].map((d, i) => (
                            <option key={i} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filterMileage}
                        onChange={(e) => setFilterMileage(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                        <option value="">All Mileage Limits</option>
                        {[...new Set(policies.map((p) => p.mileageLimit))].map((m, i) => (
                            <option key={i} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                <table className="min-w-full text-sm text-gray-700 border-separate border-spacing-y-1">
                    <thead className="bg-gray-100 text-gray-900 font-semibold">
                        <tr>
                            <th className="py-3 px-4 text-left">Name</th>
                            <th className="py-3 px-4 text-left">Duration Period</th>
                            <th className="py-3 px-4 text-left">Mileage Limit</th>
                            <th className="py-3 px-4 text-left">Description</th>
                            <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPolicies.map((p, index) => (
                            <tr
                                key={index}
                                className="bg-white border border-gray-200 hover:shadow-sm transition duration-100 h-[60px]"
                            >
                                <td
                                    className="py-3 px-4 font-medium text-blue-600 hover:underline cursor-pointer"
                                    onClick={() => handleView(p)}
                                    title="Click to view details"
                                >
                                    {p.name}
                                </td>
                                <td className="py-3 px-4">{p.durationPeriod}</td>
                                <td className="py-3 px-4">{p.mileageLimit}</td>
                                <td className="py-3 px-4 text-gray-600 truncate max-w-[300px]">
                                    {p.description}
                                </td>

                                {/* ✅ Action column */}
                                <td className="py-3 px-4 text-center align-middle">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditing(p);
                                                setFormData(p);
                                                setShowModal(true);
                                            }}
                                            className="flex items-center justify-center w-9 h-9 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.name)}
                                            className="flex items-center justify-center w-9 h-9 rounded-md bg-red-500 hover:bg-red-600 text-white transition shadow-sm"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {currentPolicies.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                                    No warranty policies found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                <span>
                    Showing {startIndex + 1}–
                    {Math.min(startIndex + itemsPerPage, filteredPolicies.length)} of{" "}
                    {filteredPolicies.length} items
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

            {/* Modal - Add/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[460px] p-6 animate-fadeIn">
                        <h2 className="text-lg font-semibold mb-4">
                            {editing ? "Edit Warranty Policy" : "Add New Warranty Policy"}
                        </h2>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Policy Name"
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />

                            <textarea
                                placeholder="Description"
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />

                            <input
                                type="text"
                                placeholder="Duration Period (e.g. 24 months)"
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                value={formData.durationPeriod}
                                onChange={(e) =>
                                    setFormData({ ...formData, durationPeriod: e.target.value })
                                }
                            />

                            <input
                                type="text"
                                placeholder="Mileage Limit (e.g. 40,000 km)"
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                value={formData.mileageLimit}
                                onChange={(e) =>
                                    setFormData({ ...formData, mileageLimit: e.target.value })
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-5">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditing(null);
                                }}
                                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ View Details Modal */}
            {showViewModal && selectedPolicy && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[480px] p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Eye size={20} className="text-gray-700" />
                            Warranty Policy Details
                        </h2>

                        <div className="space-y-3 text-gray-700">
                            <p>
                                <b>Name:</b> {selectedPolicy.name}
                            </p>
                            <p>
                                <b>Duration Period:</b> {selectedPolicy.durationPeriod}
                            </p>
                            <p>
                                <b>Mileage Limit:</b> {selectedPolicy.mileageLimit}
                            </p>
                            <p>
                                <b>Description:</b>
                                <br />
                                <span className="block mt-1 text-gray-600">
                                    {selectedPolicy.description}
                                </span>
                            </p>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarrantyPolicyManagement;
