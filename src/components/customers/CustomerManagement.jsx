import React, { useState } from "react";
import { UserPlus, Car, User, Plus, Search, Filter } from "lucide-react";
import CustomerTable from "./CustomerTable";

const CustomerManagement = ({
  vehicles,
  customersMap,
  loading,
  onShowForm,
  onViewVehicle,
  onEditCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const registeredVehicles = vehicles.filter(
    (vehicle) => vehicle.customerName && vehicle.customerName !== "N/A"
  );
  const availableVehicles = vehicles.filter((v) => v.customerName === "N/A");

  const filteredVehicles = registeredVehicles.filter((vehicle) => {
    const customer = customersMap[vehicle.vin];
    const searchLower = searchTerm.toLowerCase();

    return (
      vehicle.vin?.toLowerCase().includes(searchLower) ||
      vehicle.modelName?.toLowerCase().includes(searchLower) ||
      vehicle.customerName?.toLowerCase().includes(searchLower) ||
      vehicle.licensePlate?.toLowerCase().includes(searchLower) ||
      (customer && customer.phoneNumber?.toLowerCase().includes(searchLower)) ||
      (customer && customer.email?.toLowerCase().includes(searchLower))
    );
  });

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
              Customer Registration
            </h1>
            <p className="text-gray-600 mt-2">
              Manage registered customers and their vehicle information
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Vehicles
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {vehicles.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Car className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Registered Customers
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {registeredVehicles.length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <User className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Available for Registration
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {availableVehicles.length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <Car className="text-gray-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by VIN, model, customer name, phone, email, or license plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            onClick={() => setSearchTerm("")}
            className="inline-flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={20} />
            Reset
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <CustomerTable
        vehicles={filteredVehicles}
        customersMap={customersMap}
        loading={loading}
        searchTerm={searchTerm}
        onViewVehicle={onViewVehicle}
        onRegister={onShowForm}
        onEditCustomer={onEditCustomer}
      />
    </>
  );
};

export default CustomerManagement;
