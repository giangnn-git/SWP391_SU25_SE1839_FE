import { useState } from "react";

const ClaimTable = ({ claims, loading, onView, onEdit }) => {
    const [actionLoading, setActionLoading] = useState(null);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!claims || claims.length === 0) {
        return <div className="text-center py-8 text-gray-500">No claims found</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            VIN
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mileage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Part Claims
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                    {claims.map((claim, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {claim.vin || "-"}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {claim.mileage ? `${claim.mileage} km` : "-"}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${claim.priority === "URGENT"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-green-100 text-green-800"
                                        }`}
                                >
                                    {claim.priority}
                                </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[250px] truncate">
                                {claim.description || "-"}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {claim.partClaims && claim.partClaims.length > 0 ? (
                                    <ul className="list-disc pl-4">
                                        {claim.partClaims.map((part, i) => (
                                            <li key={i}>
                                                ID: {part.id || "N/A"} - Qty: {part.quantity || 0}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    "-"
                                )}
                            </td>

                            {/* 🔹 Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => onView && onView(claim)}
                                        className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                                        disabled={actionLoading === claim.id}
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => onEdit && onEdit(claim)}
                                        className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                                        disabled={actionLoading === claim.id}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClaimTable;
