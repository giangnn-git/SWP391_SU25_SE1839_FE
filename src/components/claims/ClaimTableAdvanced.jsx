import React from "react";

const ClaimTableAdvanced = ({ data }) => {
    if (data.length === 0)
        return (
            <div className="text-center text-gray-500 text-sm bg-white rounded-xl p-6 shadow">
                No claims found.
            </div>
        );

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3 text-left">Claim Details</th>
                        <th className="px-4 py-3 text-left">Vehicle & Customer</th>
                        <th className="px-4 py-3 text-left">Service Center</th>
                        <th className="px-4 py-3 text-left">Cost</th>
                        <th className="px-4 py-3 text-left">Priority</th>
                        <th className="px-4 py-3 text-left">Warranty</th>
                        <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((claim) => (
                        <tr
                            key={claim.id}
                            className="border-b last:border-0 hover:bg-gray-50 transition"
                        >
                            <td className="px-4 py-3">
                                <div className="font-medium text-gray-800">{claim.id}</div>
                                <div className="text-xs text-gray-500">
                                    VIN: {claim.vin}
                                </div>
                                <div className="text-xs text-gray-400">
                                    Submitted: {claim.date} by {claim.submittedBy}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="font-medium">{claim.model}</div>
                                <div className="text-xs text-gray-500">{claim.customer}</div>
                            </td>
                            <td className="px-4 py-3">{claim.serviceCenter}</td>
                            <td className="px-4 py-3">
                                ${claim.cost.toLocaleString()}
                                <div className="text-xs text-gray-400">{claim.labor}</div>
                            </td>
                            <td className="px-4 py-3">
                                <span
                                    className={`px-2 py-1 text-xs rounded-full font-medium ${claim.priority === "High"
                                        ? "bg-red-100 text-red-700"
                                        : claim.priority === "Medium"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {claim.priority}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                                    {claim.warranty}
                                </span>
                                <div className="text-xs text-gray-400">
                                    Until: {claim.warrantyEnd}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span
                                    className={`flex items-center gap-1 text-xs font-medium ${claim.status === "Pending"
                                        ? "text-blue-600"
                                        : claim.status === "Approved"
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                >
                                    {claim.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClaimTableAdvanced;
