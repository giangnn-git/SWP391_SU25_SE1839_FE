import React, { useMemo, useState } from "react";
import { UserPlus, Plus, Search } from "lucide-react"; // ✅ Đã xóa Filter
import CustomerTable from "./CustomerTable";

const CustomerManagement = ({
  onShowForm,
  customersSummary = [],
  loadingCustomersSummary = false,
  onViewCustomer,
  onEditCustomer,
  searchTerm, // ✅ Nhận searchTerm từ props
  onSearchChange, // ✅ Nhận onSearchChange từ props
}) => {
  // ✅ ĐÃ XÓA state searchTerm nội bộ, sử dụng từ props

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return customersSummary;
    const q = searchTerm.toLowerCase();
    return customersSummary.filter((c) =>
      [c?.id, c?.name, c?.phoneNumber, c?.email, c?.address]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [customersSummary, searchTerm]);

  return (
    <>
      {/* Header */}
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

          <button
            onClick={onShowForm}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={20} />
            Register Customer
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, phone, email, address, or ID…"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)} // ✅ Sử dụng onSearchChange từ props
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          {/* ✅ ĐÃ XÓA NÚT RESET */}
        </div>
      </div>

      {/* Table */}
      <CustomerTable
        customers={filtered}
        loading={loadingCustomersSummary}
        onViewCustomer={onViewCustomer}
        onEditCustomer={onEditCustomer}
      />
    </>
  );
};

export default CustomerManagement;