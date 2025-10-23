import React from "react";
import { Clock4, CheckCircle2, XCircle } from "lucide-react";

const PartRequestTable = ({
    requests = [],
    loading,
    error,
    currentPage,
    setCurrentPage,
}) => {
    // ✅ Format ngày từ mảng [year, month, day, hour, min]
    const formatDate = (arr) => {
        if (!Array.isArray(arr)) return "-";
        const [y, m, d, hh, mm] = arr;
        return `${d.toString().padStart(2, "0")}/${m
            .toString()
            .padStart(2, "0")}/${y} ${hh}:${mm}`;
    };

    // ✅ Render trạng thái đẹp mắt
    const renderStatusBadge = (status) => {
        const base =
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border";

        switch (status) {
            case "APPROVED":
                return (
                    <span
                        className={`${base} bg-green-50 text-green-700 border-green-200`}
                    >
                        <CheckCircle2 size={12} /> Approved
                    </span>
                );
            case "REJECTED":
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

    // ✅ Hiển thị lỗi
    if (error) {
        return (
            <div className="p-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-xl">
                {error}
            </div>
        );
    }

    // ✅ Hiển thị loading
    if (loading) {
        return (
            <div className="p-6 text-center text-gray-500 italic">
                Loading part requests...
            </div>
        );
    }

    // ✅ Không có dữ liệu
    if (!requests.length) {
        return (
            <div className="p-10 text-center text-gray-500 italic">
                No part requests found.
            </div>
        );
    }

    // ✅ Pagination
    const itemsPerPage = 8;
    const totalPages = Math.ceil(requests.length / itemsPerPage);
    const paginated = requests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
            <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
                    <tr>
                        <th className="py-3 px-4 text-left font-semibold">#</th>
                        <th className="py-3 px-4 text-left font-semibold">Service Center</th>
                        <th className="py-3 px-4 text-left font-semibold">Created By</th>
                        <th className="py-3 px-4 text-left font-semibold">Created Date</th>
                        <th className="py-3 px-4 text-left font-semibold">Status</th>
                        <th className="py-3 px-4 text-left font-semibold">Note</th>
                    </tr>
                </thead>
                <tbody>
                    {paginated.map((req, index) => (
                        <tr
                            key={req.id}
                            className="hover:bg-blue-50/60 transition-colors border-b border-gray-100"
                        >
                            <td className="py-3 px-4 font-medium text-gray-800">
                                {req.id || index + 1}
                            </td>
                            <td className="py-3 px-4">{req.serviceCenterName || "-"}</td>
                            <td className="py-3 px-4">{req.createdBy || "-"}</td>
                            <td className="py-3 px-4">{formatDate(req.createdDate)}</td>
                            <td className="py-3 px-4">{renderStatusBadge(req.status)}</td>
                            <td className="py-3 px-4">{req.note || "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
                    <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 text-sm rounded-md border ${currentPage === 1
                                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                : "text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            Prev
                        </button>
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 text-sm rounded-md border ${currentPage === totalPages
                                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                : "text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartRequestTable;
