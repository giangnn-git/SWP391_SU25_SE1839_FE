import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ChevronLeft, ChevronRight, AlertCircle, Loader } from "lucide-react";

const ClaimTable = ({ claims = [], loading, error }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const claimsPerPage = 15;

  const navigate = useNavigate();

  const totalPages = Math.ceil(claims.length / claimsPerPage);
  const startIndex = (currentPage - 1) * claimsPerPage;
  const currentClaims = claims.slice(startIndex, startIndex + claimsPerPage);

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { bg: "bg-gray-100", text: "text-yellow-800", label: "Draft" },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
      },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
      completed: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Completed",
      },
    };

    const statusLower = status?.toLowerCase() || "draft";
    const config = statusMap[statusLower] || statusMap.pending;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Claims List</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {currentClaims.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + claimsPerPage, claims.length)} of{" "}
            {claims.length} claims
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Loading claims...</p>
            </div>
          </div>
        ) : currentClaims.length > 0 ? (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      VIN / Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Sender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentClaims.map((claim) => (
                    <tr
                      key={claim.id}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          WC-{String(claim.id).padStart(3, "0")}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            {claim.vin}
                          </div>
                          <div className="text-xs text-gray-500">
                            {claim.licensePlate || "–"} ,{" "}
                            {claim.userName || "–"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 line-clamp-2">
                          {claim.description || "–"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {claim.senderName || "–"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(claim.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {claim.claimDate
                            ? `${String(claim.claimDate[2]).padStart(
                                2,
                                "0"
                              )}/${String(claim.claimDate[1]).padStart(
                                2,
                                "0"
                              )}/${claim.claimDate[0]}`
                            : "–"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(claim.currentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 text-sm font-medium"
                          onClick={() => navigate(`/claim/${claim.id}`)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page <span className="font-semibold">{currentPage}</span> of{" "}
                <span className="font-semibold">{totalPages}</span>
              </p>

              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => {
                    const page = i + 1;
                    // Show first 2, last 2, and pages around current
                    if (
                      page <= 2 ||
                      page >= totalPages - 1 ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg border transition-colors ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600 font-semibold"
                              : "border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === 3 && currentPage > 4) ||
                      (page === totalPages - 2 && currentPage < totalPages - 3)
                    ) {
                      return (
                        <span key={page} className="px-3 py-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={20} className="text-gray-700" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No claims found</p>
              <p className="text-gray-500 text-sm mt-1">
                There are no claims matching your criteria
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      high: "bg-red-50 text-red-700 border-red-200",
      medium: "bg-orange-50 text-orange-700 border-orange-200",
      low: "bg-blue-50 text-blue-700 border-blue-200",
    };

    const priorityLower = priority?.toLowerCase() || "low";
    const className = priorityMap[priorityLower] || priorityMap.low;

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium border ${className}`}
      >
        {priority}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Claims List</h2>
        <p className="text-sm text-gray-500 mt-1">
          Showing {currentClaims.length > 0 ? startIndex + 1 : 0} to{" "}
          {Math.min(startIndex + claimsPerPage, claims.length)} of{" "}
          {claims.length} claims
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle
            className="text-red-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading claims...</p>
          </div>
        </div>
      ) : currentClaims.length > 0 ? (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    VIN / Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        WC-{String(claim.id).padStart(3, "0")}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                          {claim.vin}
                        </div>
                        <div className="text-xs text-gray-500">
                          {claim.licensePlate || "–"} , {claim.userName || "–"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 line-clamp-2">
                        {claim.description || "–"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {claim.senderName || "–"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(claim.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {claim.claimDate
                          ? `${String(claim.claimDate[2]).padStart(
                              2,
                              "0"
                            )}/${String(claim.claimDate[1]).padStart(2, "0")}/${
                              claim.claimDate[0]
                            }`
                          : "–"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(claim.currentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 text-sm font-medium"
                        onClick={() => navigate(`/claim/${claim.id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page <span className="font-semibold">{currentPage}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>
            </p>

            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => {
                  const page = i + 1;
                  // Show first 2, last 2, and pages around current
                  if (
                    page <= 2 ||
                    page >= totalPages - 1 ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600 font-semibold"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    (page === 3 && currentPage > 4) ||
                    (page === totalPages - 2 && currentPage < totalPages - 3)
                  ) {
                    return (
                      <span key={page} className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No claims found</p>
            <p className="text-gray-500 text-sm mt-1">
              There are no claims matching your criteria
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimTable;
