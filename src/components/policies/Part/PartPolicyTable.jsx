import React from "react";
import { Eye, Trash2 } from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Fallback to original string if error
  }
};

const PartPolicyTable = ({
  policies,
  loading,
  onView,
  onDelete,
  actionLoading,
  currentPage,
  itemsPerPage,
  totalItems,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading part policies...</span>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No part policies found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full text-sm text-gray-700 border-separate border-spacing-y-1">
        <thead className="bg-gray-100 text-gray-900 font-semibold">
          <tr>
            <th className="py-3 px-4 text-left">Part Code</th>
            <th className="py-3 px-4 text-left">Part Name</th>
            <th className="py-3 px-4 text-left">Policy Code</th>
            <th className="py-3 px-4 text-left">Start Date</th>
            <th className="py-3 px-4 text-left">End Date</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((policy) => {
            const isActive = new Date(policy.endDate) >= new Date();

            return (
              <tr
                key={policy.id}
                className="bg-white border border-gray-200 hover:shadow-sm transition duration-100 h-[60px]"
              >
                <td className="py-3 px-4 font-mono text-sm font-medium bg-gray-50 rounded">
                  {policy.partCode}
                </td>
                <td className="py-3 px-4 text-gray-900">{policy.partName}</td>
                <td className="py-3 px-4 font-mono text-sm font-medium bg-blue-50 text-blue-700 rounded">
                  {policy.policyCode}
                </td>
                <td className="py-3 px-4">{formatDate(policy.startDate)}</td>
                <td className="py-3 px-4">{formatDate(policy.endDate)}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isActive ? "Active" : "Expired"}
                  </span>
                </td>

                {/* Action Column */}
                <td className="py-3 px-4 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    {/* View Button */}
                    <button
                      onClick={() => onView(policy)}
                      className="flex items-center justify-center w-9 h-9 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => onDelete(policy)}
                      className="flex items-center justify-center w-9 h-9 rounded-md bg-red-600 hover:bg-red-700 text-white transition shadow-sm disabled:opacity-50"
                      title="Delete"
                      disabled={actionLoading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PartPolicyTable;
