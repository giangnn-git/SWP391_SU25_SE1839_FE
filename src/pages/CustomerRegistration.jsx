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
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  getAllVehiclesApi,
  createCustomerApi,
  getCustomerByVinApi,
  getCampaignByVinApi,
} from "../services/api.service";
import axios from "axios";

const CustomerRegistration = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewVehicle, setViewVehicle] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingCampaign, setLoadingCampaign] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("customer");
  const [customersMap, setCustomersMap] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    licensePlate: "",
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

  // Computed values
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

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVehicles = filteredVehicles.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Effects
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // API Functions
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await getAllVehiclesApi();
      const data = res.data?.data?.vehicles || [];
      setVehicles(data);

      // Fetch customer details cho tất cả vehicles
      await fetchCustomersForVehicles(data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicle data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetail = async (vin) => {
    try {
      setLoadingCustomer(true);
      const response = await getCustomerByVinApi(vin);
      setCustomerDetail(response.data.data);
    } catch (err) {
      console.error("Error fetching customer details:", err);
      setCustomerDetail(null);
    } finally {
      setLoadingCustomer(false);
    }
  };

  const fetchCustomersForVehicles = async (vehicles) => {
    const registeredVehicles = vehicles.filter(
      (vehicle) => vehicle.customerName && vehicle.customerName !== "N/A"
    );

    // Fetch customer details cho tất cả registered vehicles
    const customerPromises = registeredVehicles.map(async (vehicle) => {
      try {
        const response = await getCustomerByVinApi(vehicle.vin);
        return {
          vin: vehicle.vin,
          customer: response.data.data,
        };
      } catch (err) {
        console.error(`Error fetching customer for VIN ${vehicle.vin}:`, err);
        return {
          vin: vehicle.vin,
          customer: null,
        };
      }
    });

    const customerResults = await Promise.all(customerPromises);

    // Convert array thành object map
    const customersMap = customerResults.reduce((acc, result) => {
      if (result.customer) {
        acc[result.vin] = result.customer;
      }
      return acc;
    }, {});

    setCustomersMap(customersMap);
  };

  const fetchCampaignByVin = async (vin) => {
    try {
      setLoadingCampaign(true);
      const response = await getCampaignByVinApi(vin);
      setCampaignData(response.data.data);
    } catch (err) {
      if (err.response?.status === 500) {
        setCampaignData(null);
      } else {
        console.error("Error fetching campaign:", err);
        setCampaignData(null);
      }
    } finally {
      setLoadingCampaign(false);
    }
  };

  const handleViewVehicle = async (vehicle) => {
    const vehicleData = vehicle.vehicle || vehicle;

    if (!vehicleData?.vin) {
      console.warn("⚠️ No VIN found for selected vehicle");
      return;
    }

    setViewVehicle(vehicleData);
    setCustomerDetail(null);
    setCampaignData(null);
    setActiveDetailTab("customer");

    await Promise.allSettled([
      fetchCustomerDetail(vehicleData.vin),
      fetchCampaignByVin(vehicleData.vin),
    ]);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
        licensePlate: "",
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

  const filteredVins = availableVehicles.filter(
    (vehicle) =>
      vehicle.vin?.toLowerCase().includes(vinSearch.toLowerCase()) ||
      vehicle.modelName?.toLowerCase().includes(vinSearch.toLowerCase())
  );

  const handleVinSelect = (vin) => {
    setSelectedVin(vin);
    setVinSearch(vin);
    setShowVinDropdown(false);
  };

  const handleVinInputChange = (value) => {
    setVinSearch(value);
    setSelectedVin(value);
    setShowVinDropdown(true);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "N/A";
    const [year, month, day] = dateArray;
    return `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${year}`;
  };

  // Component để hiển thị thông tin khách hàng
  const CustomerInfo = ({ vehicle }) => {
    if (!vehicle) return null;

    // Check if customer data is still loading
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
              onClick={() => setShowForm(true)}
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
              onClick={fetchVehicles}
              className="inline-flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={20} />
              Reset
            </button>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              {success}
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              {error}
            </div>
          </div>
        )}

        {/* Vehicles Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
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
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
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
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <FileText size={12} className="mr-1" />
                                {vehicleData.licensePlate}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                No Plate
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleViewVehicle(vehicle)}
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                              <Eye size={16} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}

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
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstItem + 1}-
                      {Math.min(indexOfLastItem, filteredVehicles.length)} of{" "}
                      {filteredVehicles.length} vehicles
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="text-blue-600" size={20} />
                Vehicle & Customer Details
              </h2>
              <button
                onClick={() => {
                  setViewVehicle(null);
                  setCustomerDetail(null);
                  setCampaignData(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Vehicle Summary */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <Car className="text-blue-600" size={24} />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg">
                    {viewVehicle.vin}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                    <span>
                      {viewVehicle.modelName} • {viewVehicle.productYear}
                    </span>
                    {viewVehicle.licensePlate && (
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <FileText size={14} />
                        {viewVehicle.licensePlate}
                      </span>
                    )}
                  </div>
                  {campaignData && (
                    <div className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                      <Shield size={14} />
                      Active Campaign: {campaignData.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <div className="flex px-6">
                <button
                  onClick={() => setActiveDetailTab("customer")}
                  className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                    activeDetailTab === "customer"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  👤 Customer Information
                </button>
                <button
                  onClick={() => setActiveDetailTab("warranty")}
                  className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                    activeDetailTab === "warranty"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  🛡️ Warranty & Campaigns
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="overflow-y-auto max-h-96">
              {/* Customer Information Tab */}
              {activeDetailTab === "customer" && (
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="text-green-600" size={18} />
                    Customer Details
                  </h3>

                  {loadingCustomer ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">
                        Loading customer details...
                      </span>
                    </div>
                  ) : customerDetail ? (
                    <div className="space-y-3 bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 text-sm">
                        <User className="text-gray-500" size={16} />
                        <span className="text-gray-600 font-medium w-20">
                          Name:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {customerDetail.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="text-gray-500" size={16} />
                        <span className="text-gray-600 font-medium w-20">
                          Phone:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {customerDetail.phoneNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="text-gray-500" size={16} />
                        <span className="text-gray-600 font-medium w-20">
                          Email:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {customerDetail.email}
                        </span>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="text-gray-500 mt-0.5" size={16} />
                        <span className="text-gray-600 font-medium w-20">
                          Address:
                        </span>
                        <span className="font-semibold text-gray-900 flex-1">
                          {customerDetail.address}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                      <User className="mx-auto mb-2 text-gray-400" size={24} />
                      <p>No customer details found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Warranty & Campaigns Tab */}
              {activeDetailTab === "warranty" && (
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="text-orange-600" size={18} />
                    Warranty Campaign
                  </h3>

                  {loadingCampaign ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">
                        Loading campaign details...
                      </span>
                    </div>
                  ) : campaignData ? (
                    <div className="space-y-4">
                      <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-lg mb-1">
                              {campaignData.name}
                            </div>
                            {campaignData.code && (
                              <div className="text-sm text-gray-600">
                                Code: {campaignData.code}
                              </div>
                            )}
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle size={12} className="mr-1" />
                            Active
                          </span>
                        </div>

                        {campaignData.description && (
                          <div className="text-sm text-gray-700 mb-4 p-3 bg-white rounded-lg border">
                            {campaignData.description}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-gray-600 font-medium">
                                Campaign Period:
                              </span>
                            </div>
                            <div className="ml-6 space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Start:</span>
                                <span className="font-medium">
                                  {formatDate(campaignData.startDate)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">End:</span>
                                <span className="font-medium">
                                  {formatDate(campaignData.endDate)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-gray-600 font-medium">
                                Production Period:
                              </span>
                            </div>
                            <div className="ml-6 space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">From:</span>
                                <span className="font-medium">
                                  {formatDate(campaignData.produceDateFrom)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">To:</span>
                                <span className="font-medium">
                                  {formatDate(campaignData.produceDateTo)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                      <AlertCircle
                        className="mx-auto mb-2 text-gray-400"
                        size={24}
                      />
                      <p className="font-medium">No active campaign found</p>
                      <p className="text-sm mt-1">
                        This vehicle is not part of any warranty campaign
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Register Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="text-blue-600" size={20} />
                Register New Customer
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedVin("");
                  setVinSearch("");
                }}
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g. 0901234567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    License Plate
                  </label>
                  <div className="relative">
                    <FileText
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g. 51A-12345"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-3 transform text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g. Hanoi, Vietnam"
                    />
                  </div>
                </div>
              </div>

              {/* VIN Combobox */}
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
                    className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Type VIN or select from available vehicles..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowVinDropdown(!showVinDropdown)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ChevronDown size={20} />
                  </button>

                  {showVinDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
                <p className="text-xs text-gray-500">
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
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
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
