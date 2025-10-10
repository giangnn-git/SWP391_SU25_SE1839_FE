import { useState } from "react";

const ClaimTable = ({ claims, loading, error }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const claimsPerPage = 15; // ✅ Hiển thị 15 claim mỗi trang

    const totalPages = Math.ceil(claims.length / claimsPerPage);
    const startIndex = (currentPage - 1) * claimsPerPage;
    const currentClaims = claims.slice(startIndex, startIndex + claimsPerPage);

    return (
        <div>
            <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-2 text-left">Description</th>
                            <th className="px-4 py-2 text-left">Mileage</th>
                            <th className="px-4 py-2 text-left">VIN</th>
                            <th className="px-4 py-2 text-left">Priority</th>
                            <th className="px-4 py-2 text-left">Parts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-6">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="5" className="text-center text-red-500 py-6">
                                    {error}
                                </td>
                            </tr>
                        ) : currentClaims.length > 0 ? (
                            currentClaims.map((claim, i) => (
                                <tr key={i} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">{claim.description}</td>
                                    <td className="px-4 py-2">{claim.mileage?.toLocaleString()} km</td>
                                    <td className="px-4 py-2">{claim.vin}</td>
                                    <td className="px-4 py-2">{claim.priority}</td>
                                    <td className="px-4 py-2">
                                        {claim.partClaims?.map((p, idx) => (
                                            <div key={idx}>
                                                ID: {p.id}, Qty: {p.quantity}
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-6">
                                    Không có claim nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        className="px-3 py-1 border rounded-md"
                    >
                        ◀
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 border rounded-md ${currentPage === i + 1 ? "bg-blue-500 text-white" : ""
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        className="px-3 py-1 border rounded-md"
                    >
                        ▶
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClaimTable;
