import React from "react";
import { Eye } from "lucide-react";

const WarrantyPolicyTable = ({
  policies,
  loading,
  onView,
  onEdit,
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
        <span className="ml-3 text-gray-600">Loading policies...</span>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 italic">
        No warranty policies found.
      </div>
    );
  }

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full text-sm text-gray-700 border-separate border-spacing-y-1">
        <thead className="bg-gray-100 text-gray-900 font-semibold">
          <tr>
            <th className="py-3 px-4 text-left">Name</th>
            <th className="py-3 px-4 text-left">Duration Period</th>
            <th className="py-3 px-4 text-left">Mileage Limit</th>
            <th className="py-3 px-4 text-left">Description</th>
            <th className="py-3 px-4 text-center">Details</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((policy, index) => (
            <tr
              key={policy.id}
              className="bg-white border border-gray-200 hover:shadow-sm transition duration-100 h-[60px]"
            >
              <td className="py-3 px-4 font-medium text-gray-900">
                {policy.name}
              </td>
              <td className="py-3 px-4">{policy.durationPeriod}</td>
              <td className="py-3 px-4">{policy.mileageLimit}</td>
              <td className="py-3 px-4 text-gray-600 truncate max-w-[300px]">
                {policy.description}
              </td>

              {/* Detail Column */}
              <td className="py-3 px-4 text-center align-middle">
                <button
                  onClick={() => onView(policy)}
                  className="flex items-center justify-center w-9 h-9 rounded-md bg-green-600 hover:bg-green-700 text-white transition shadow-sm mx-auto"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
              </td>

              {/* Action Column */}
              <td className="py-3 px-4 text-center align-middle">
                <div className="flex items-center justify-center gap-2">
                  {/* ✅ EDIT */}
                  <button
                    onClick={() => onEdit(policy)}
                    className="flex items-center justify-center w-9 h-9 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm disabled:opacity-50"
                    title="Edit"
                    disabled={actionLoading}
                  >
                    ✏️
                  </button>

                  {/* ✅ DELETE (truyền toàn bộ policy thay vì chỉ id) */}
                  <button
                    onClick={() => onDelete(policy)}
                    className="flex items-center justify-center w-9 h-9 rounded-md bg-red-500 hover:bg-red-600 text-white transition shadow-sm disabled:opacity-50"
                    title="Delete"
                    disabled={actionLoading}
                  >
                    🗑️
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

export default WarrantyPolicyTable;
