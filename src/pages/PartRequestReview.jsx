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
                prev.map((req) => (req.id === id ? { ...req, status: decision } : req))
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
        const matchesFilter = filter === "All" ? true : req.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status) => {
        const base =
            "inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border min-w-[90px] text-center";
        switch (status) {
            case "Approved":
                return (
                    <span
                        className={`${base} bg-green-50 text-green-700 border-green-200`}
                    >
                        <CheckCircle2 size={12} /> Approved
                    </span>
                );
            case "Rejected":
                return (
                    <span className={`${base} bg-red-50 text-red-700 border-red-200`}>
                        <XCircle size={12} /> Rejected
                    </span>
                );
            default:
                return (
                    <span
                        className={`${base} bg-yellow-50 text-yellow-700 border-yellow-200`}
                    >
                        <Clock4 size={12} /> Pending
                    </span>
                );
        }
    };

    // ✅ Thống kê trạng thái
    const totalApproved = requests.filter((r) => r.status === "Approved").length;
    const totalPending = requests.filter((r) => r.status === "Pending").length;
    const totalRejected = requests.filter((r) => r.status === "Rejected").length;

    return (
        <div className="p-8 animate-fadeIn bg-gradient-to-br from-gray-50 to-white min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
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

                {/* Toggle View Buttons */}
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

            {/* ✅ KPI STATUS BAR */}
            <div className="grid grid-cols-3 gap-5 mb-8">
                <div className="flex items-center justify-between bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/90 rounded-lg text-white">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-800">
                                Approved Requests
                            </h3>
                            <p className="text-2xl font-bold text-green-700">
                                {totalApproved}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/90 rounded-lg text-white">
                            <Clock4 size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-800">
                                Pending Requests
                            </h3>
                            <p className="text-2xl font-bold text-yellow-700">
                                {totalPending}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/90 rounded-lg text-white">
                            <XCircle size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-800">
                                Rejected Requests
                            </h3>
                            <p className="text-2xl font-bold text-red-700">
                                {totalRejected}
                            </p>
                        </div>
                    </div>
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

            {/* Table or Card View */}
            {viewMode === "table" ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
                    <table className="w-full text-sm text-gray-700">
                        <thead className="bg-emerald-50 text-gray-800">
                            <tr>
                                <th className="py-3 px-4 text-left font-semibold w-[18%]">
                                    Part Name
                                </th>
                                <th className="py-3 px-4 text-left font-semibold w-[8%]">
                                    Qty
                                </th>
                                <th className="py-3 px-4 text-left font-semibold w-[28%]">
                                    Reason
                                </th>
                                <th className="py-3 px-4 text-left font-semibold w-[15%]">
                                    Requester
                                </th>
                                <th className="py-3 px-4 text-left font-semibold w-[16%]">
                                    Date
                                </th>
                                <th className="py-3 px-4 text-center font-semibold w-[10%]">
                                    Status
                                </th>
                                <th className="py-3 px-4 text-center font-semibold w-[10%]">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((req, index) => (
                                <tr
                                    key={req.id}
                                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                        } border-t border-gray-100 hover:bg-emerald-50/40 transition`}
                                >
                                    <td className="py-3 px-4 font-medium text-gray-900">
                                        {req.partName}
                                    </td>
                                    <td className="py-3 px-4 text-gray-700">{req.quantity}</td>
                                    <td className="py-3 px-4 text-gray-700 truncate max-w-[200px]">
                                        {req.reason}
                                    </td>
                                    <td className="py-3 px-4 text-gray-700">{req.requester}</td>
                                    <td className="py-3 px-4 text-gray-500">{req.date}</td>
                                    <td className="py-3 px-4 text-center">
                                        {getStatusBadge(req.status)}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => setSelectedRequest(req)}
                                            className="group flex items-center justify-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-full 
             bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm 
             hover:bg-emerald-600 hover:text-white hover:shadow-md 
             transition-all duration-300"
                                        >
                                            <Eye
                                                size={16}
                                                className="text-emerald-600 group-hover:text-white transition-colors duration-300"
                                            />
                                            <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                                                View
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
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
                                    className="group flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium rounded-full 
             bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm 
             hover:bg-emerald-600 hover:text-white hover:shadow-md hover:scale-[1.04]
             transition-all duration-300"
                                >
                                    <Eye
                                        size={16}
                                        className="text-emerald-600 group-hover:text-white transition-colors duration-300"
                                    />
                                    <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                                        View Details
                                    </span>
                                </button>
                            </div>
                        </div>
                    ))}
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
                            <p>
                                <b>Part:</b> {selectedRequest.partName}
                            </p>
                            <p>
                                <b>Quantity:</b> {selectedRequest.quantity}
                            </p>
                            <p>
                                <b>Reason:</b> {selectedRequest.reason}
                            </p>
                            <p>
                                <b>Requester:</b> {selectedRequest.requester}
                            </p>
                            <p>
                                <b>Date:</b> {selectedRequest.date}
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-800">Status:</p>
                                {getStatusBadge(selectedRequest.status)}
                            </div>
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
                                        onClick={() => handleDecision(selectedRequest.id, "Approved")}
                                        className="group flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full
             bg-green-50 text-green-700 border border-green-200 shadow-sm
             hover:bg-green-600 hover:text-white hover:shadow-md hover:scale-[1.03]
             transition-all duration-300"
                                    >
                                        {processing ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <CheckCircle2
                                                size={16}
                                                className="text-green-600 group-hover:text-white transition-colors duration-300"
                                            />
                                        )}
                                        <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                                            Approve
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => handleDecision(selectedRequest.id, "Rejected")}
                                        className="group flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full
             bg-red-50 text-red-700 border border-red-200 shadow-sm
             hover:bg-red-600 hover:text-white hover:shadow-md hover:scale-[1.03]
             transition-all duration-300"
                                    >
                                        {processing ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <XCircle
                                                size={16}
                                                className="text-red-600 group-hover:text-white transition-colors duration-300"
                                            />
                                        )}
                                        <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                                            Reject
                                        </span>
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
