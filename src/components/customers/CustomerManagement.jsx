import React, { useMemo } from "react";
import { UserPlus, Plus } from "lucide-react";
import CustomerTable from "./CustomerTable";

const CustomerManagement = ({
  onShowForm,
  customersSummary = [],
  loadingCustomersSummary = false,
  onViewCustomer,
  onViewVehicle,
  onAddVehicle,
  searchTerm,
  onSearchChange,
  showHeader = false,
  showRegisterBtn = false,
}) => {
  // Filter logic đơn giản - chỉ dùng cho basic filtering nếu cần
  const filtered = useMemo(() => {
    return customersSummary; // Đã được filter từ parent component
  }, [customersSummary]);

  return (
    <>
      {showHeader && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <UserPlus className="text-blue-600" size={28} />
                </div>
                Customer Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage customers and their registered vehicles
              </p>
            </div>

            {showRegisterBtn && (
              <button
                onClick={onShowForm}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={20} />
                Register Customer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <CustomerTable
        customers={filtered}
        loading={loadingCustomersSummary}
        onViewCustomer={onViewCustomer}
        onViewVehicle={onViewVehicle}
        onAddVehicle={onAddVehicle}
      />
    </>
  );
};

export default CustomerManagement;
