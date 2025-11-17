import React, { useState } from "react";
import {
  Eye,
  FileText,
  Calendar,
  Clock,
  ToggleLeft,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";

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
    return dateString;
  }
};

const PartPolicyTable = ({
  policies,
  loading,
  onView,
  onStatusToggle,
  actionLoading,
  currentPage,
  itemsPerPage,
  totalItems,
  sortConfig,
  onSort,
}) => {
  const [statusLoading, setStatusLoading] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({
    startDate: false,
    endDate: false,
  });

  // Toggle dropdown
  const toggleDropdown = (column) => {
    setDropdownOpen((prev) => ({
      startDate: false,
      endDate: false,
      [column]: !prev[column],
    }));
  };

  // Handle sort selection
  const handleSortSelect = (column, direction) => {
    onSort(column, direction);
    setDropdownOpen((prev) => ({
      ...prev,
      [column]: false,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          <span className="text-gray-600 text-sm">
            Loading part policies...
          </span>
        </div>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No part policies found
        </h3>
        <p className="text-gray-600 max-w-sm mx-auto">
          Get started by creating your first part warranty policy.
        </p>
      </div>
    );
  }

  // Handle status toggle
  const handleStatusToggle = async (policy) => {
    if (!onStatusToggle) return;

    setStatusLoading((prev) => ({ ...prev, [policy.id]: true }));

    try {
      await onStatusToggle(policy.id);
    } finally {
      setStatusLoading((prev) => ({ ...prev, [policy.id]: false }));
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 font-semibold border-b border-gray-200">
          <tr>
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-500" />
                Part Information
              </div>
            </th>
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-500" />
                Policy Code
              </div>
            </th>

            {/* Start Date Column with Dropdown */}
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider">
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span>Start Date</span>
                  <button
                    onClick={() => toggleDropdown("startDate")}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        dropdownOpen.startDate ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen.startDate && (
                  <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handleSortSelect("startDate", "asc")}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      Ascending
                    </button>
                    <button
                      onClick={() => handleSortSelect("startDate", "desc")}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      Descending
                    </button>
                  </div>
                )}
              </div>
            </th>

            {/* End Date Column with Dropdown */}
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider">
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span>End Date</span>
                  <button
                    onClick={() => toggleDropdown("endDate")}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        dropdownOpen.endDate ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen.endDate && (
                  <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handleSortSelect("endDate", "asc")}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      Ascending
                    </button>
                    <button
                      onClick={() => handleSortSelect("endDate", "desc")}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      Descending
                    </button>
                  </div>
                )}
              </div>
            </th>

            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-500" />
                Coverage Status
              </div>
            </th>
            <th className="py-4 px-6 text-left text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <ToggleLeft size={16} className="text-gray-500" />
                Policy Status
              </div>
            </th>
            <th className="py-4 px-6 text-center text-xs uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {policies.map((policy) => {
            const isCoverageActive = new Date(policy.endDate) >= new Date();
            const isPolicyActive = policy.status === "ACTIVE";

            return (
              <tr
                key={policy.id}
                className="hover:bg-gray-50 transition-colors duration-200 group"
              >
                {/* Part Information Column */}
                <td className="py-4 px-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          {policy.partCode}
                        </div>
                        <div className="text-sm text-gray-900 font-medium mt-1">
                          {policy.partName}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Policy Code Column */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <FileText size={16} className="text-green-600" />
                    </div>
                    <span className="font-mono text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                      {policy.policyCode}
                    </span>
                  </div>
                </td>

                {/* Start Date Column */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium">
                      {formatDate(policy.startDate)}
                    </span>
                  </div>
                </td>

                {/* End Date Column */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium">
                      {formatDate(policy.endDate)}
                    </span>
                  </div>
                </td>

                {/* Coverage Status Column */}
                <td className="py-4 px-6">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold ${
                      isCoverageActive
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {isCoverageActive ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Available
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Expired
                      </>
                    )}
                  </div>
                </td>

                {/* Policy Status Column */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleStatusToggle(policy)}
                      disabled={statusLoading[policy.id] || actionLoading}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isPolicyActive
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-300 hover:bg-gray-400"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          isPolicyActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>

                    <div className="flex items-center gap-2">
                      {statusLoading[policy.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : isPolicyActive ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <XCircle size={16} className="text-gray-400" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          isPolicyActive ? "text-green-700" : "text-gray-500"
                        }`}
                      >
                        {policy.status}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Actions Column */}
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView(policy)}
                      className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md border border-blue-200"
                      title="View Details"
                    >
                      <Eye size={18} />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        View Details
                      </div>
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
