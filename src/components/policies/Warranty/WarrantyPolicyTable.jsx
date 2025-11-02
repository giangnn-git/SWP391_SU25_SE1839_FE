import React, { useState } from "react";
import {
  Eye,
  Edit,
  FileText,
  Calendar,
  Gauge,
  Clock,
  Shield,
  Tag,
  Layers,
  ToggleLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";

const WarrantyPolicyTable = ({
  policies,
  loading,
  onView,
  onEdit,
  onStatusToggle,
  actionLoading,
  currentPage,
  itemsPerPage,
  totalItems,
}) => {
  const [statusLoading, setStatusLoading] = useState({});

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          <span className="text-gray-600 text-sm">
            Loading warranty policies...
          </span>
        </div>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
        <Shield size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No warranty policies found
        </h3>
        <p className="text-gray-600 max-w-sm mx-auto">
          Get started by creating your first warranty policy.
        </p>
      </div>
    );
  }

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    return `${duration} months`;
  };

  const formatMileage = (mileage) => {
    if (!mileage) return "N/A";
    return `${mileage.toLocaleString()} km`;
  };

  // Handle Status Toggle
  const handleStatusToggle = async (policy) => {
    if (!onStatusToggle) return;

    setStatusLoading((prev) => ({ ...prev, [policy.id]: true }));

    try {
      await onStatusToggle(policy);
    } finally {
      setStatusLoading((prev) => ({ ...prev, [policy.id]: false }));
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gradient-to-r from-green-50 to-emerald-100 text-gray-900 font-semibold border-b border-gray-200">
          <tr>
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-green-600" />
                Policy Code
              </div>
            </th>
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-green-600" />
                Policy Type
              </div>
            </th>
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-green-600" />
                Policy Name
              </div>
            </th>
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-green-600" />
                Duration
              </div>
            </th>
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-green-600" />
                Mileage Limit
              </div>
            </th>
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <ToggleLeft size={16} className="text-green-600" />
                Status
              </div>
            </th>
            <th className="py-4 px-6 text-center text-xs uppercase tracking-wider">
              Details
            </th>
            <th className="py-4 px-6 text-center text-xs uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {policies.map((policy) => (
            <tr
              key={policy.id}
              className="hover:bg-green-50 transition-colors duration-200 group"
            >
              {/* Policy Code */}
              <td className="py-4 px-6 font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-gray-500" />
                  {policy.code || "N/A"}
                </div>
              </td>

              {/* Policy Type */}
              <td className="py-4 px-6">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    policy.policyType === "PROMOTION"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {policy.policyType || "N/A"}
                </span>
              </td>

              {/* Policy Name */}
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield size={18} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-base">
                      {policy.name}
                    </div>
                  </div>
                </div>
              </td>

              {/* Duration */}
              <td className="py-4 px-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={18} className="text-green-500" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {formatDuration(policy.durationPeriod)}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      Time period
                    </div>
                  </div>
                </div>
              </td>

              {/* Mileage */}
              <td className="py-4 px-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <Gauge size={18} className="text-blue-500" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {formatMileage(policy.mileageLimit)}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      Distance limit
                    </div>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleStatusToggle(policy)}
                    disabled={statusLoading[policy.id] || actionLoading}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      policy.status === "ACTIVE"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-300 hover:bg-gray-400"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        policy.status === "ACTIVE"
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>

                  <div className="flex items-center gap-2">
                    {statusLoading[policy.id] ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    ) : policy.status === "ACTIVE" ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <XCircle size={16} className="text-gray-400" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        policy.status === "ACTIVE"
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      {policy.status}
                    </span>
                  </div>
                </div>
              </td>

              {/* Details */}
              <td className="py-4 px-6">
                <div className="flex justify-center">
                  <button
                    onClick={() => onView(policy)}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-all duration-200 shadow-sm hover:shadow-md border border-green-200"
                    title="View Details"
                  >
                    <Eye size={18} />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      View Details
                    </div>
                  </button>
                </div>
              </td>

              {/* Actions  */}
              <td className="py-4 px-6">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(policy)}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit Policy"
                    disabled={actionLoading}
                  >
                    <Edit size={18} />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      Edit Policy
                    </div>
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
