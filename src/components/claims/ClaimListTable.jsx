import React from "react";
import { Eye } from "lucide-react";
import ClaimStatusTag from "./ClaimStatusTag";

const ClaimListTable = ({ claims, onViewDetails }) => {
    if (claims.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
                No claims found.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 text-left">Claim ID</th>
                        <th className="px-4 py-3 text-left">VIN</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Service Center</th>
                        <th className="px-4 py-3 text-left">Part</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {claims.map((claim) => (
                        <tr key={claim.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">{claim.id}</td>
                            <td className="px-4 py-3">{claim.vin}</td>
                            <td className="px-4 py-3">{claim.customer}</td>
                            <td className="px-4 py-3">{claim.serviceCenter}</td>
                            <td className="px-4 py-3">{claim.part}</td>
                            <td className="px-4 py-3">{claim.date}</td>
                            <td className="px-4 py-3">
                                <ClaimStatusTag status={claim.status} />
                            </td>
                            <td className="px-4 py-3 text-center">
                                <button
                                    onClick={() => onViewDetails(claim)}
                                    className="p-2 text-blue-600 hover:text-blue-800 transition"
                                >
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClaimListTable;
