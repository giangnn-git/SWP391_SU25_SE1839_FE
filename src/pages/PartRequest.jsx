import React, { useState } from "react";
import {
    PackageSearch,
    Send,
    ClipboardList,
    PlusCircle,
    X,
    CheckCircle2,
    Clock4,
    AlertCircle,
    Loader2,
} from "lucide-react";

const PartRequestPage = () => {
    const [formData, setFormData] = useState({
        partName: "",
        quantity: "",
        reason: "",
    });

    const [requests, setRequests] = useState([]);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.partName || !formData.quantity || !formData.reason) {
            setError("Please fill in all fields before submitting.");
            return;
        }

        setLoading(true);

        setTimeout(() => {
            const newRequest = {
                id: Date.now(),
                ...formData,
                status: "Pending",
                date: new Date().toLocaleString("en-GB"),
            };

            setRequests([newRequest, ...requests]);
            setFormData({ partName: "", quantity: "", reason: "" });
            setSuccess("✅ Request submitted successfully!");
            setLoading(false);
            setTimeout(() => setSuccess(""), 3000);
        }, 800);
    };

    return (
        <div className="p-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 rounded-2xl shadow-sm">
                    <PackageSearch size={28} className="text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Request Parts from Manufacturer
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Submit a replacement part request directly to the EVM team.
                    </p>
                </div>
            </div>

            {/* Alerts */}
            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 animate-fadeIn">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-medium">{success}</span>
                </div>
            )}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 animate-fadeIn">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                    <button
                        onClick={() => setError("")}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Form */}
            <div className="bg-white/90 border border-gray-200 rounded-2xl shadow-md p-6 mb-10 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-5">
                    <ClipboardList size={20} className="text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-800">
                        New Part Request
                    </h2>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-3 gap-5"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Part Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter part name..."
                            value={formData.partName}
                            onChange={(e) =>
                                handleInputChange("partName", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                        </label>
                        <input
                            type="number"
                            min="1"
                            placeholder="Enter quantity"
                            value={formData.quantity}
                            onChange={(e) =>
                                handleInputChange("quantity", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for Request
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., VIN1234 battery replacement"
                            value={formData.reason}
                            onChange={(e) =>
                                handleInputChange("reason", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>

                    <div className="md:col-span-3 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white transition-all duration-300 shadow-md ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Send Request
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Request Table */}
            <div className="bg-white/90 border border-gray-200 rounded-2xl shadow-md p-6 transition-all duration-300">
                <div className="flex items-center gap-2 mb-5">
                    <Clock4 size={20} className="text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-800">
                        My Request History
                    </h2>
                </div>

                {requests.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 italic">
                        No requests submitted yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-gray-700 border-collapse">
                            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 text-gray-700">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold">Part Name</th>
                                    <th className="py-3 px-4 text-left font-semibold">Quantity</th>
                                    <th className="py-3 px-4 text-left font-semibold">Reason</th>
                                    <th className="py-3 px-4 text-left font-semibold">Date</th>
                                    <th className="py-3 px-4 text-left font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr
                                        key={req.id}
                                        className="border-b border-gray-100 hover:bg-blue-50/60 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-medium">{req.partName}</td>
                                        <td className="py-3 px-4">{req.quantity}</td>
                                        <td className="py-3 px-4 text-gray-700">{req.reason}</td>
                                        <td className="py-3 px-4 text-gray-500">{req.date}</td>
                                        <td className="py-3 px-4">
                                            {req.status === "Pending" && (
                                                <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
                                                    <Clock4 size={12} /> Pending
                                                </span>
                                            )}
                                            {req.status === "Approved" && (
                                                <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
                                                    <CheckCircle2 size={12} /> Approved
                                                </span>
                                            )}
                                            {req.status === "Rejected" && (
                                                <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium">
                                                    <X size={12} /> Rejected
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartRequestPage;
