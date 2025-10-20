import React from "react";
import { CheckCircle, XCircle, Eye } from "lucide-react";

const ClaimApprovedTable = ({ claims, onApprove, onReject }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
            <div className="px-4 py-3 border-b text-gray-700 text-sm font-medium">
                Approval Requests ({claims.length} found)
            </div>

            <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-600">
                    <tr>
                        <th className="py-3 px-4 text-left">Claim ID</th>
                        <th className="py-3 px-4 text-left">Vehicle & Customer</th>
                        <th className="py-3 px-4 text-left">Service Center</th>
                        <th className="py-3 px-4 text-left">Cost</th>
                        <th className="py-3 px-4 text-left">Priority</th>
                        <th className="py-3 px-4 text-left">Warranty</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-left">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {claims.map((c, i) => (
                        <tr key={i} className="border-t hover:bg-gray-50 transition">
                            <td className="py-3 px-4">
                                <div className="font-medium text-gray-900">{c.id}</div>
                                <div className="text-xs text-gray-500">VIN: {c.vin}</div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="font-semibold">{c.vehicle}</div>
                                <div className="text-gray-600 text-sm">{c.customer}</div>
                            </td>
                            <td className="py-3 px-4">{c.serviceCenter}</td>
                            <td className="py-3 px-4">{c.cost}</td>
                            <td className="py-3 px-4">
                                <span
                                    className={`px-2 py-1 rounded-lg text-xs font-medium ${c.priority === "High"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {c.priority}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">
                                    {c.warrantyStatus}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <span
                                    className={`px-2 py-1 rounded-lg text-xs font-medium ${c.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : c.status === "Approved"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {c.status}
                                </span>
                            </td>
                            <td className="py-3 px-4 flex items-center gap-2">
                                {c.status === "Pending" ? (
                                    <>
                                        <button
                                            onClick={() => onApprove(c.id)}
                                            className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition"
                                        >
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                        <button
                                            onClick={() => onReject(c.id)}
                                            className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition"
                                        >
                                            <XCircle size={14} /> Reject
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">No action</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClaimApprovedTable;
