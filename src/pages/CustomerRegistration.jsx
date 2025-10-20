import React, { useState, useEffect, useRef } from "react";
import {
  UserPlus,
  Eye,
  X,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Car,
  ChevronDown,
  Check,
} from "lucide-react";
import { getAllVehiclesApi, createCustomerApi } from "../services/api.service";

const CustomerRegistration = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewVehicle, setViewVehicle] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    vin: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State cho VIN combobox
  const [vinSearch, setVinSearch] = useState("");
  const [showVinDropdown, setShowVinDropdown] = useState(false);
  const [selectedVin, setSelectedVin] = useState("");
  const vinDropdownRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Hide notifications automatically after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        vinDropdownRef.current &&
        !vinDropdownRef.current.contains(event.target)
      ) {
        setShowVinDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await getAllVehiclesApi();
      const data = res.data?.data?.vehicles || [];
      setVehicles(data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicle data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form — call backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phoneNumber || !selectedVin) {
      setError("Please fill all required fields before submitting.");
      setSuccess("");
      return;
    }

    try {
      await createCustomerApi({
        ...formData,
        vin: selectedVin,
      });
      setSuccess("Customer registered successfully!");
      setError("");
      setShowForm(false);
      setFormData({
        name: "",
        phoneNumber: "",
        email: "",
        address: "",
        vin: "",
      });
      setSelectedVin("");
      setVinSearch("");
      fetchVehicles();
    } catch (err) {
      setError(
        `Failed to register customer: ${
          err.response?.data?.message || "Please try again."
        }`
      );
    }
  };

  // Get available VINs for dropdown (chưa đăng ký)
  const availableVehicles = vehicles.filter((v) => v.customerName === "N/A");

  // Filter VINs based on search input
  const filteredVins = availableVehicles.filter(
    (vehicle) =>
      vehicle.vin?.toLowerCase().includes(vinSearch.toLowerCase()) ||
      vehicle.modelName?.toLowerCase().includes(vinSearch.toLowerCase())
  );

  // Handle VIN selection
  const handleVinSelect = (vin) => {
    setSelectedVin(vin);
    setVinSearch(vin);
    setShowVinDropdown(false);
  };

  // Handle manual VIN input
  const handleVinInputChange = (value) => {
    setVinSearch(value);
    setSelectedVin(value);
    setShowVinDropdown(true);
  };

  // 🔥 CHỈ HIỂN THỊ CÁC VIN ĐÃ CÓ CUSTOMER ĐĂNG KÝ
  const registeredVehicles = vehicles.filter(
    (vehicle) => vehicle.customerName && vehicle.customerName !== "N/A"
  );

  // Filter vehicles based on search term (chỉ trên registered vehicles)
  const filteredVehicles = registeredVehicles.filter(
    (vehicle) =>
      vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVehicles = filteredVehicles.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getStatusBadge = (customerName) => {
    const isRegistered = customerName !== "N/A";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isRegistered
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {isRegistered ? "Registered" : "Available"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
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
                Manage registered customers and their vehicle VINs
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl 
                         hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl 
                         active:scale-95 font-medium group"
            >
              <Plus
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
              Register New Customer
            </button>
          </div>
        </div>

        {/* Stats Cards - UPDATED */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Vehicles
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {vehicles.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Car className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Registered Customers
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {registeredVehicles.length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <User className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Available for Registration
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {vehicles.length - registeredVehicles.length}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <Car className="text-gray-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search registered customers by VIN, model, or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter size={20} />
              Filter
            </button>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {success}
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {error}
            </div>
          </div>
        )}

        {/* Vehicles Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Vehicle Information
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentVehicles.map((vehicle, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50/50 transition-colors duration-150 group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <Car className="text-blue-600" size={18} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {vehicle.vin}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                <span>{vehicle.modelName}</span>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {vehicle.productYear}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {vehicle.customerName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(vehicle.customerName)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setViewVehicle(vehicle)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 hover:shadow-sm group/btn"
                            title="View details"
                          >
                            <Eye
                              size={16}
                              className="group-hover/btn:scale-110 transition-transform"
                            />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredVehicles.length === 0 && (
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
                              onClick={() => setShowForm(true)}
                              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstItem + 1}-
                      {Math.min(indexOfLastItem, filteredVehicles.length)} of{" "}
                      {filteredVehicles.length} registered customers
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
            </>
          )}
        </div>
      </div>

      {/* View Detail Modal */}
      {viewVehicle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/80">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="text-blue-600" size={20} />
                Customer & Vehicle Details
              </h2>
              <button
                onClick={() => setViewVehicle(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <Car className="text-blue-600" size={20} />
                <div>
                  <div className="font-semibold text-gray-900">
                    {viewVehicle.vin}
                  </div>
                  <div className="text-sm text-gray-600">
                    {viewVehicle.modelName} • {viewVehicle.productYear}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="text-gray-400" size={16} />
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium text-gray-900">
                    {viewVehicle.customerName}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Phone className="text-gray-400" size={16} />
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">
                    {viewVehicle.phoneNumber || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="text-gray-400" size={16} />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">
                    {viewVehicle.email || "N/A"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                {getStatusBadge(viewVehicle.customerName)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Form Modal - VIN COMBOBOX */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200/80 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="text-blue-600" size={20} />
                Register New Customer
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Name *
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g. 0901234567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g. Hanoi, Vietnam"
                    />
                  </div>
                </div>
              </div>

              {/* 🔥 VIN COMBOBOX  */}
              <div className="space-y-2" ref={vinDropdownRef}>
                <label className="block text-sm font-medium text-gray-700">
                  Vehicle VIN *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={vinSearch}
                    onChange={(e) => handleVinInputChange(e.target.value)}
                    onFocus={() => setShowVinDropdown(true)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Type VIN or select from available vehicles..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowVinDropdown(!showVinDropdown)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ChevronDown size={20} />
                  </button>

                  {/* Dropdown Menu */}
                  {showVinDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredVins.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No available vehicles found
                        </div>
                      ) : (
                        filteredVins.map((vehicle, index) => (
                          <div
                            key={index}
                            onClick={() => handleVinSelect(vehicle.vin)}
                            className={`px-4 py-3 cursor-pointer transition-colors hover:bg-blue-50 flex items-center justify-between ${
                              selectedVin === vehicle.vin ? "bg-blue-50" : ""
                            }`}
                          >
                            <div>
                              <div className="font-medium text-gray-900">
                                {vehicle.vin}
                              </div>
                              <div className="text-sm text-gray-600">
                                {vehicle.modelName} • {vehicle.productYear}
                              </div>
                            </div>
                            {selectedVin === vehicle.vin && (
                              <Check size={16} className="text-blue-600" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {availableVehicles.length} available vehicles. Type to search
                  or select from dropdown.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedVin("");
                    setVinSearch("");
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl 
                             hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl 
                             active:scale-95 font-medium"
                >
                  <UserPlus size={16} />
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRegistration;
