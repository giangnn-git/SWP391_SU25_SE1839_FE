import React, { useState } from "react";
import { PlusCircle, Search, FileText, Filter } from "lucide-react";
import CreatePolicyModal from "../components/policies/CreatePolicyModal";
import PolicyStatusTag from "../components/policies/PolicyStatusTag";

const dummyPolicies = [
    {
        id: 1,
        partName: "Battery Pack 48V",
        model: "EVM-A1",
        duration: 24,
        conditions: "Replace if degraded >20%",
        status: "Active",
    },
    {
        id: 2,
        partName: "Inverter Module",
        model: "EVM-B1",
        duration: 12,
        conditions: "Warranty excludes overheating",
        status: "Active",
    },
    {
        id: 3,
        partName: "Motor Drive Unit",
        model: "EVM-C2",
        duration: 18,
        conditions: "Applies only under normal usage",
        status: "Expired",
    },
];

const PartPolicyManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All"); // ✅ new state
    const [policies, setPolicies] = useState(dummyPolicies);
    const [showModal, setShowModal] = useState(false);
    const [editPolicy, setEditPolicy] = useState(null);

    const filteredPolicies = policies.filter((p) => {
        const matchesSearch =
            p.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.status.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "All" ? true : p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSavePolicy = (newData) => {
        if (editPolicy) {
            setPolicies((prev) =>
                prev.map((p) => (p.id === editPolicy.id ? { ...p, ...newData } : p))
            );
        } else {
            const newPolicy = {
                id: policies.length + 1,
                ...newData,
            };
            setPolicies([...policies, newPolicy]);
        }

        setShowModal(false);
        setEditPolicy(null);
    };

    const handleEdit = (policy) => {
        setEditPolicy(policy);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this policy?")) {
            setPolicies(policies.filter((p) => p.id !== id));
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <FileText className="text-gray-800" size={26} />
                    <h1 className="text-2xl font-semibold">
                        Part Warranty Policy Management
                    </h1>
                </div>

                <button
                    className="flex items-center bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md transition"
                    onClick={() => setShowModal(true)}
                >
                    <PlusCircle size={18} className="mr-2" />
                    Add New Policy
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center flex-grow gap-2">
                    <Search size={18} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by part, model, or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                </div>

                {/* ✅ Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-600" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-gray-100 text-gray-900 text-left font-semibold">
                        <tr>
                            <th className="py-3 px-4">Part Name</th>
                            <th className="py-3 px-4">Model</th>
                            <th className="py-3 px-4 text-center">Duration (months)</th>
                            <th className="py-3 px-4">Conditions</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPolicies.map((policy) => (
                            <tr
                                key={policy.id}
                                className="border-t hover:bg-gray-50 transition-colors duration-100"
                            >
                                <td className="py-3 px-4 font-medium">{policy.partName}</td>
                                <td className="py-3 px-4">{policy.model}</td>
                                <td className="py-3 px-4 text-center">{policy.duration}</td>
                                <td className="py-3 px-4">{policy.conditions}</td>
                                <td className="py-3 px-4">
                                    <PolicyStatusTag status={policy.status} />
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button
                                        className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition mr-2"
                                        onClick={() => handleEdit(policy)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                                        onClick={() => handleDelete(policy.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {filteredPolicies.length === 0 && (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="text-center py-6 text-gray-500 italic"
                                >
                                    No policies found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <CreatePolicyModal
                    onClose={() => {
                        setShowModal(false);
                        setEditPolicy(null);
                    }}
                    onSave={handleSavePolicy}
                    editData={editPolicy}
                />
            )}
        </div>
    );
};

export default PartPolicyManagement;
