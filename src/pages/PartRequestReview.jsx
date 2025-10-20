import React, { useState } from "react";
import {
    PackageSearch,
    CheckCircle2,
    XCircle,
    Clock4,
    Search,
    Eye,
    LayoutGrid,
    Table,
    Loader2,
    Filter,
} from "lucide-react";

const PartRequestReview = () => {
    const [requests, setRequests] = useState([
        {
            id: 1,
            partName: "Battery Module A",
            quantity: 2,
            reason: "VIN12345 - Battery fault detected",
            status: "Pending",
            date: "2025-10-17 10:45",
            requester: "SC_Hanoi",
        },
        {
            id: 2,
            partName: "Inverter V3",
            quantity: 1,
            reason: "VIN98765 - Inverter malfunction",
            status: "Approved",
            date: "2025-10-16 09:30",
            requester: "SC_Danang",
        },
    ]);

    const [filter, setFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    const [viewMode, setViewMode] = useState("table");

    const handleDecision = (id, decision) => {
        setProcessing(true);
        setTimeout(() => {
            setRequests((prev) =>
                prev.map((req) =>
                    req.id === id ? { ...req, status: decision } : req
                )
            );
            setProcessing(false);
            setActionMessage(
                decision === "Approved"
                    ? "✅ Request approved successfully!"
                    : "❌ Request rejected successfully!"
            );
            setTimeout(() => setActionMessage(""), 1500);
        }, 800);
    };

    const filteredRequests = requests.filter((req) => {
        const matchesSearch =
            req.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.reason.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filter === "All" ? true : req.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status) => {
        const base = "px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5";
        switch (status) {
            case "Approved":
                return (
                    <span className={`${base} bg-green-100 text-green-700 border border-green-200`}>
                        <CheckCircle2 size={12} /> Approved
                    </span>
                );
            case "Rejected":
                return (
                    <span className={`${base} bg-red-100 text-red-700 border border-red-200`}>
                        <XCircle size={12} /> Rejected
                    </span>
                );
            default:
                return (
                    <span className={`${base} bg-yellow-100 text-yellow-700 border border-yellow-200`}>
                        <Clock4 size={12} /> Pending
                    </span>
                );
        }
    };

    return (
        <div className="p-8 animate-fadeIn bg-gradient-to-br from-gray-50 to-white min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-2xl shadow-lg text-white">
                        <PackageSearch size={26} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Part Request Review
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Review and approve part requests submitted by Service Centers.
                        </p>
                    </div>
                </div>

                {/* ✅ Toggle View Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode("table")}
                        className={`p-2 rounded-lg border ${viewMode === "table"
                            ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
                            } transition-all`}
                        title="Table View"
                    >
                        <Table size={18} />
                    </button>

                    <button
                        onClick={() => setViewMode("card")}
                        className={`p-2 rounded-lg border ${viewMode === "card"
                            ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
                            } transition-all`}
                        title="Card View"
                    >
                        <LayoutGrid size={18} />
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-md p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Filter size={18} className="text-gray-500" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    >
                        <option value="All">All Requests</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search by part or reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
            </div>

            {/* ✅ Conditional View Mode */}
            {viewMode === "card" ? (
                // --- CARD VIEW ---
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredRequests.map((req) => (
                        <div
                            key={req.id}
                            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-semibold text-gray-800">
                                    {req.partName}
                                </h3>
                                {getStatusBadge(req.status)}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                    <b>Quantity:</b> {req.quantity}
                                </p>
                                <p className="line-clamp-2">
                                    <b>Reason:</b> {req.reason}
                                </p>
                                <p>
                                    <b>Requester:</b> {req.requester}
                                </p>
                                <p className="text-xs text-gray-500">{req.date}</p>
                            </div>
                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={() => setSelectedRequest(req)}
                                    className="text-sm px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
                                >
                                    <Eye size={14} className="inline mr-1" /> View Details
                                </button>
                                {req.status === "Pending" && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDecision(req.id, "Approved")}
                                            className="px-3 py-2 text-sm rounded-lg bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 transition"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleDecision(req.id, "Rejected")}
                                            className="px-3 py-2 text-sm rounded-lg bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // --- TABLE VIEW ---
                <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
                    <table className="w-full text-sm text-gray-700">
                        <thead className="bg-emerald-50 text-gray-800">
                            <tr>
                                <th className="py-3 px-4 text-left font-semibold">Part Name</th>
                                <th className="py-3 px-4 text-left font-semibold">Quantity</th>
                                <th className="py-3 px-4 text-left font-semibold">Reason</th>
                                <th className="py-3 px-4 text-left font-semibold">Requester</th>
                                <th className="py-3 px-4 text-left font-semibold">Date</th>
                                <th className="py-3 px-4 text-left font-semibold">Status</th>
                                <th className="py-3 px-4 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((req) => (
                                <tr
                                    key={req.id}
                                    className="border-t border-gray-100 hover:bg-emerald-50/40 transition"
                                >
                                    <td className="py-3 px-4 font-medium">{req.partName}</td>
                                    <td className="py-3 px-4">{req.quantity}</td>
                                    <td className="py-3 px-4">{req.reason}</td>
                                    <td className="py-3 px-4">{req.requester}</td>
                                    <td className="py-3 px-4 text-gray-500">{req.date}</td>
                                    <td className="py-3 px-4">{getStatusBadge(req.status)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => setSelectedRequest(req)}
                                            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                                        >
                                            <Eye size={14} className="inline mr-1" /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Toast Notification */}
            {actionMessage && (
                <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fadeIn">
                    {actionMessage}
                </div>
            )}

            {/* Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-[480px] p-6 relative animate-slideUp border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Eye size={20} className="text-emerald-600" />
                            Request Details
                        </h2>

                        <div className="space-y-3 text-sm text-gray-700">
                            <p><b>Part:</b> {selectedRequest.partName}</p>
                            <p><b>Quantity:</b> {selectedRequest.quantity}</p>
                            <p><b>Reason:</b> {selectedRequest.reason}</p>
                            <p><b>Requester:</b> {selectedRequest.requester}</p>
                            <p><b>Date:</b> {selectedRequest.date}</p>
                            <p><b>Status:</b> {getStatusBadge(selectedRequest.status)}</p>
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition"
                            >
                                Close
                            </button>
                            {selectedRequest.status === "Pending" && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            handleDecision(selectedRequest.id, "Approved")
                                        }
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm shadow-sm"
                                    >
                                        {processing ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <CheckCircle2 size={16} />
                                        )}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDecision(selectedRequest.id, "Rejected")
                                        }
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm shadow-sm"
                                    >
                                        {processing ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <XCircle size={16} />
                                        )}
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartRequestReview;
