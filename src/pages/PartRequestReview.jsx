import React, { useEffect, useState } from "react";
import {
    PackageSearch,
    CheckCircle2,
    XCircle,
    Clock4,
    Search,
    Eye,
    Loader2,
    Filter,
} from "lucide-react";
import axios from "axios";
import {
    getAllPartRequestsApi,
    approvePartRequestApi,
    rejectPartRequestApi,
    getPartRequestDetailApi,
} from "../services/api.service";

const PartRequestReview = () => {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // ✅ Lấy danh sách yêu cầu phụ tùng (có gọi API chi tiết để lấy part và quantity)
    const fetchRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (token)
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const res = await getAllPartRequestsApi();
            let data = res.data;

            if (Array.isArray(data?.data?.partSupplies)) {
                data = data.data.partSupplies;
            } else if (Array.isArray(data)) {
                data = data;
            } else {
                data = [];
            }

            // 🔥 Gọi song song API chi tiết để lấy part và quantity thật
            const detailedList = await Promise.all(
                data.map(async (item) => {
                    try {
                        const detailRes = await getPartRequestDetailApi(item.id);
                        const details = detailRes.data?.data?.details || [];
                        const firstDetail = details[0] || {};

                        return {
                            id: item.id,
                            partName: firstDetail.partCode || "—",
                            quantity: firstDetail.requestedQuantity || "—",
                            reason: item.note || "-",
                            status:
                                item.status === "PENDING"
                                    ? "Pending"
                                    : item.status === "APPROVED"
                                        ? "Approved"
                                        : "Rejected",
                            date: formatDate(item.createdDate),
                            requester: item.serviceCenterName || "Unknown",
                        };
                    } catch (err) {
                        console.warn("⚠️ Failed to fetch details for request", item.id);
                        return {
                            id: item.id,
                            partName: "—",
                            quantity: "—",
                            reason: item.note || "-",
                            status:
                                item.status === "PENDING"
                                    ? "Pending"
                                    : item.status === "APPROVED"
                                        ? "Approved"
                                        : "Rejected",
                            date: formatDate(item.createdDate),
                            requester: item.serviceCenterName || "Unknown",
                        };
                    }
                })
            );

            setRequests(detailedList);
        } catch (err) {
            console.error("❌ Error fetching part requests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // ✅ Lấy chi tiết 1 yêu cầu
    const handleViewDetail = async (id) => {
        setSelectedRequest({ id, loading: true });
        setDetailLoading(true);

        try {
            const res = await getPartRequestDetailApi(id);
            const data = res.data?.data || {};
            setSelectedRequest(data);
        } catch (err) {
            console.error("❌ Error fetching part request detail:", err);
            setSelectedRequest({
                id,
                error: "Failed to load details. Please try again.",
            });
        } finally {
            setDetailLoading(false);
        }
    };

    // ✅ Xử lý phê duyệt hoặc từ chối
    const handleDecision = async (id, decision) => {
        setProcessing(true);
        try {
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, status: decision } : r
                )
            );

            setSelectedRequest((prev) => ({
                ...prev,
                status: decision.toUpperCase(),
            }));

            setActionMessage(
                decision === "Approved"
                    ? "✅ Request approved successfully!"
                    : "❌ Request rejected successfully!"
            );
        } catch (err) {
            console.error("❌ Error updating request:", err);
            setActionMessage("Failed to update request status.");
        } finally {
            setProcessing(false);
            setTimeout(() => setActionMessage(""), 2000);
        }
    };

    const formatDate = (arr) => {
        if (!Array.isArray(arr)) return "-";
        const [y, m, d, hh, mm] = arr;
        return `${d.toString().padStart(2, "0")}/${m
            .toString()
            .padStart(2, "0")}/${y} ${hh}:${mm}`;
    };

    const filteredRequests = requests.filter((req) => {
        const matchesSearch =
            req.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.reason?.toLowerCase().includes(searchTerm.toLowerCase());
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
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-5 mb-8">
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/90 rounded-lg text-white">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-800">Approved Requests</h3>
                            <p className="text-2xl font-bold text-green-700">{totalApproved}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/90 rounded-lg text-white">
                            <Clock4 size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-800">Pending Requests</h3>
                            <p className="text-2xl font-bold text-yellow-700">{totalPending}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/90 rounded-lg text-white">
                            <XCircle size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-800">Rejected Requests</h3>
                            <p className="text-2xl font-bold text-red-700">{totalRejected}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter bar */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Filter size={18} className="text-gray-500" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        <Loader2 className="mx-auto animate-spin mb-2" /> Loading requests...
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 italic">
                        No part requests found.
                    </div>
                ) : (
                    <table className="w-full text-sm text-gray-700">
                        <thead className="bg-emerald-50 text-gray-800">
                            <tr>
                                <th className="py-3 px-4 text-left font-semibold">Part</th>
                                <th className="py-3 px-4 text-left font-semibold">Quantity</th>
                                <th className="py-3 px-4 text-left font-semibold">Reason</th>
                                <th className="py-3 px-4 text-left font-semibold">Requester</th>
                                <th className="py-3 px-4 text-left font-semibold">Date</th>
                                <th className="py-3 px-4 text-center font-semibold">Status</th>
                                <th className="py-3 px-4 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="border-t border-gray-100 hover:bg-emerald-50/40">
                                    <td className="py-3 px-4 font-medium">{req.partName}</td>
                                    <td className="py-3 px-4">{req.quantity}</td>
                                    <td className="py-3 px-4">{req.reason}</td>
                                    <td className="py-3 px-4">{req.requester}</td>
                                    <td className="py-3 px-4">{req.date}</td>
                                    <td className="py-3 px-4 text-center">{getStatusBadge(req.status)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => handleViewDetail(req.id)}
                                            className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 border border-emerald-300 rounded hover:bg-emerald-600 hover:text-white transition flex items-center gap-1"
                                        >
                                            <Eye size={14} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal chi tiết */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-[500px] p-6 relative border border-gray-100 animate-slideUp">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Eye size={20} className="text-emerald-600" />
                                Request Details
                            </h2>
                            {getStatusBadge(selectedRequest.status)}
                        </div>

                        {detailLoading ? (
                            <div className="text-center py-6 text-gray-500">
                                <Loader2 className="mx-auto animate-spin mb-2" /> Loading...
                            </div>
                        ) : (
                            <div className="space-y-3 text-sm text-gray-700">
                                <p><b>Service Center:</b> {selectedRequest.serviceCenterName || "-"}</p>
                                <p><b>Created By:</b> {selectedRequest.createdBy || "-"}</p>
                                <p><b>Note:</b> {selectedRequest.note || "-"}</p>
                                <p><b>Created Date:</b> {formatDate(selectedRequest.createdDate)}</p>

                                {Array.isArray(selectedRequest.details) && selectedRequest.details.length > 0 && (
                                    <div className="mt-3 border-t border-gray-200 pt-2">
                                        <b>Parts Requested:</b>
                                        <ul className="list-disc ml-6 mt-2 space-y-1">
                                            {selectedRequest.details.map((d, i) => (
                                                <li key={i}>
                                                    Part Code: {d.partCode || "-"} – Quantity: {d.requestedQuantity}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg 
                                           hover:bg-gray-100 transition-all duration-200"
                            >
                                Close
                            </button>

                            {selectedRequest.status === "PENDING" && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleDecision(selectedRequest.id, "Approved")}
                                        disabled={processing}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg 
                                                   bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium 
                                                   shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <CheckCircle2 size={16} />
                                        {processing ? "Processing..." : "Approve"}
                                    </button>

                                    <button
                                        onClick={() => handleDecision(selectedRequest.id, "Rejected")}
                                        disabled={processing}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg 
                                                   bg-red-500 hover:bg-red-600 text-white text-sm font-medium 
                                                   shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <XCircle size={16} />
                                        {processing ? "Processing..." : "Reject"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {actionMessage && (
                <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fadeIn">
                    {actionMessage}
                </div>
            )}
        </div>
    );
};

export default PartRequestReview;
