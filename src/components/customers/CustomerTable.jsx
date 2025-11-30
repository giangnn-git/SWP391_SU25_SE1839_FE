import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import CustomerVehiclesPreview from "./CustomerVehPreview";

const CustomerTable = ({
  customers = [],
  loading = false,
  onViewCustomer,
  onViewVehicle,
  onAddVehicle,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const itemsPerPage = 8;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(customers.length / itemsPerPage)),
    [customers.length]
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = customers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        {customers.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No customers found.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-8 px-4 py-4"></th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vehicle Count
                </th>
                {/* Đã xóa cột Actions */}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {currentRows.map((c) => (
                <React.Fragment key={c.id}>
                  {/* Main Row - Clickable for expand */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <button
                        onClick={() =>
                          setExpandedCustomer(
                            expandedCustomer === c.id ? null : c.id
                          )
                        }
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {expandedCustomer === c.id ? (
                          <ChevronUp size={16} className="text-gray-600" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-600" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">{c.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {c.name}
                    </td>
                    <td className="px-6 py-4">{c.phoneNumber}</td>
                    <td className="px-6 py-4">{c.email}</td>
                    <td className="px-6 py-4">{c.address}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          c.vehicleCount > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {c.vehicleCount}
                      </span>
                    </td>
                    {/* Đã xóa cột Actions với nút Details */}
                  </tr>

                  {/* Expanded Vehicles Row */}
                  {expandedCustomer === c.id && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50 border-t">
                        <CustomerVehiclesPreview
                          customer={c}
                          onViewVehicle={onViewVehicle}
                          onAddVehicle={onAddVehicle}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {customers.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, customers.length)} of{" "}
              {customers.length} customers
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition-all ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-gray-600 border-gray-300 hover:bg-white hover:shadow-sm"
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border transition-all ${
                  currentPage === totalPages
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-gray-600 border-gray-300 hover:bg-white hover:shadow-sm"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;
