import React, { useState } from "react";
import {
  Eye,
  UserPlus,
  Car,
  Calendar,
  FileText,
  Shield,
  User,
  Phone,
  Mail,
  Edit,
  MoreVertical,
} from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CustomerTable = ({
  vehicles,
  customersMap,
  loading,
  searchTerm,
  onViewVehicle,
  onRegister,
  onEditCustomer,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(vehicles.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVehicles = vehicles.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Component để hiển thị thông tin khách hàng
  const CustomerInfo = ({ vehicle }) => {
    if (!vehicle) return null;

    if (!customersMap.hasOwnProperty(vehicle.vin)) {
      return (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">
            {vehicle.customerName}
          </div>
          <div className="text-xs text-gray-400">Loading contact info...</div>
        </div>
      );
    }

    const customer = customersMap[vehicle.vin];

    return (
      <div className="space-y-1">
        <div className="font-medium text-gray-900">{vehicle.customerName}</div>
        {customer ? (
          <div className="text-xs text-gray-500 space-y-0.5">
            {customer.phoneNumber && (
              <div className="flex items-center gap-1">
                <Phone size={12} />
                {customer.phoneNumber}
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-1">
                <Mail size={12} />
                {customer.email}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-400">No contact info available</div>
        )}
      </div>
    );
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
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Vehicle Information
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                License Plate
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentVehicles.map((vehicle, index) => {
              const vehicleData = vehicle.vehicle || vehicle;
              const hasCampaign = vehicle.vehicle
                ? vehicle.name !== null
                : false;

              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Car className="text-blue-600" size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {vehicleData.vin}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <span>{vehicleData.modelName}</span>
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {vehicleData.productYear}
                          </span>
                        </div>
                        {hasCampaign && (
                          <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                            <Shield size={12} />
                            Has Active Campaign
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <CustomerInfo vehicle={vehicleData} />
                  </td>
                  <td className="px-6 py-4">
                    {vehicleData.licensePlate ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <FileText size={12} className="mr-1" />
                        {vehicleData.licensePlate}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        No Plate
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Button */}
                      <button
                        onClick={() => onViewVehicle(vehicle)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm"
                      >
                        <Eye size={16} />
                        View
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          const vehicleData = vehicle.vehicle || vehicle;
                          const customerData = customersMap[vehicle.vin];

                          if (
                            customerData &&
                            customerData.id &&
                            onEditCustomer
                          ) {
                            console.log("Editing customer:", {
                              vin: vehicleData.vin,
                              customerId: customerData.id,
                              licensePlate: vehicleData.licensePlate,
                            });

                            const editData = {
                              ...customerData,
                              licensePlate: vehicleData.licensePlate,
                              vin: vehicleData.vin,
                              modelName: vehicleData.modelName,
                              productYear: vehicleData.productYear,
                            };
                            onEditCustomer(editData);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200 shadow-sm"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {vehicles.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="text-gray-400 flex flex-col items-center">
                    <User className="mb-2 opacity-40" size={48} />
                    <p className="text-lg font-medium text-gray-500">
                      No registered customers found
                    </p>
                    <p className="text-sm mt-1">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "No customers have been registered yet"}
                    </p>
                    <button
                      onClick={onRegister}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <UserPlus size={16} />
                      Register First Customer
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, vehicles.length)} of {vehicles.length}{" "}
              vehicles
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
