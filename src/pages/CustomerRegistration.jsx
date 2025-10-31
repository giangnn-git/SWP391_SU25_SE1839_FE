import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, AlertCircle, X, Car, Users, Plus } from "lucide-react";
import CustomerCreate from "../components/customers/CustomerCreateAndUpdate";
import CustomerManagement from "../components/customers/CustomerManagement";
import CustomerView from "../components/customers/CustomerView";
import {
  getCustomerByVinApi,
  getCampaignByVinApi,
  getCustomersApi,
  getVehiclesByCustomerIdApi,
} from "../services/api.service";

const CustomerRegistration = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewVehicle, setViewVehicle] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingCampaign, setLoadingCampaign] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("customer");
  const [customersMap, setCustomersMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [customersSummary, setCustomersSummary] = useState([]);
  const [loadingCustomersSummary, setLoadingCustomersSummary] = useState(false);

  const [openCustomerVehicles, setOpenCustomerVehicles] = useState(false);
  const [loadingCustomerVehicles, setLoadingCustomerVehicles] = useState(false);
  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [vinCache, setVinCache] = useState({});
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customersSummary);
    } else {
      const filtered = customersSummary.filter(customer =>
        Object.values(customer).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customersSummary]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/api/vehicles");
      const data = res.data?.data?.vehicles || [];
      setVehicles(data);
      await fetchCustomersForVehicles(data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setErrorMessage("Failed to load vehicles data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersSummary = async () => {
    try {
      setLoadingCustomersSummary(true);
      const res = await getCustomersApi();
      const list = res?.data?.data ?? [];
      setCustomersSummary(list);
      setFilteredCustomers(list);
    } catch (err) {
      console.error("Error fetching customers summary:", err);
      setErrorMessage("Failed to load customers summary");
    } finally {
      setLoadingCustomersSummary(false);
    }
  };

  const fetchCustomersForVehicles = async (vehicles) => {
    const registeredVehicles = vehicles.filter(
      (vehicle) => vehicle.customerName && vehicle.customerName !== "N/A"
    );

    const customerPromises = registeredVehicles.map(async (vehicle) => {
      try {
        const response = await getCustomerByVinApi(vehicle.vin);
        return {
          vin: vehicle.vin,
          customer: {
            ...response.data.data,
            id: response.data.data.id,
            vin: vehicle.vin,
            licensePlate: vehicle.licensePlate,
            modelName: vehicle.modelName,
            productYear: vehicle.productYear,
          },
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
    const customersMap = customerResults.reduce((acc, result) => {
      if (result.customer) {
        acc[result.vin] = result.customer;
      }
      return acc;
    }, {});

    setCustomersMap(customersMap);
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

  const handleCloseDetail = () => {
    setViewVehicle(null);
    setCustomerDetail(null);
    setCampaignData(null);
  };

  // ✅ HÀM XỬ LÝ KHI EDIT THÀNH CÔNG TỪ CustomerView
  const handleEditSuccessFromView = async () => {
    setSuccessMessage("Customer updated successfully!");
    // Refresh data sau khi edit thành công
    await Promise.allSettled([fetchVehicles(), fetchCustomersSummary()]);

    // Nếu đang xem vehicle detail, refresh customer detail
    if (viewVehicle?.vin) {
      await fetchCustomerDetail(viewVehicle.vin);
    }

    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleViewCustomerRow = async (row) => {
    try {
      setViewingCustomer(row);
      setOpenCustomerVehicles(true);
      setLoadingCustomerVehicles(true);
      setCustomerVehicles([]);

      const res = await getVehiclesByCustomerIdApi(row.id);
      const list = res?.data?.data ?? res?.data ?? [];
      setCustomerVehicles(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching vehicles by customer id:", err);
      setErrorMessage("Failed to load vehicles for this customer");
      setCustomerVehicles([]);
    } finally {
      setLoadingCustomerVehicles(false);
    }
  };

  const handleRegistrationSuccess = async () => {
    setShowForm(false);
    setSuccessMessage("Customer registered successfully!");
    // ✅ TỰ ĐỘNG RESET SEARCH KHI ĐĂNG KÝ THÀNH CÔNG
    setSearchTerm("");
    await Promise.allSettled([fetchVehicles(), fetchCustomersSummary()]);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleEditError = (error) => {
    setErrorMessage(error || "Failed to update customer. Please try again.");
    setTimeout(() => setErrorMessage(""), 5000);
  };

  const handleCloseCreate = () => {
    setShowForm(false);
    setErrorMessage("");
  };

  useEffect(() => {
    Promise.allSettled([fetchVehicles(), fetchCustomersSummary()]);
  }, []);

  const formatDateTuple = (arr) =>
    Array.isArray(arr) && arr.length >= 3 ? `${arr[2]}/${arr[1]}/${arr[0]}` : "-";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
              <p className="text-gray-600">Manage customer registrations and vehicle information</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-white/80 rounded-lg px-4 py-2 border border-gray-200">
                <Users size={16} />
                <span>{customersSummary.length} customers</span>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                <Plus size={20} />
                Register Customer
              </button>
            </div>
          </div>
        </div>

        {/* Notification Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customersSummary.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Car className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Registered Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <CheckCircle className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicles.filter(v => v.campaignNames && v.campaignNames.length > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ SỬ DỤNG COMPONENT CustomerManagement - ĐÃ XÓA onEditCustomer */}
        <CustomerManagement
          onShowForm={() => setShowForm(true)}
          customersSummary={filteredCustomers}
          loadingCustomersSummary={loadingCustomersSummary}
          onViewCustomer={handleViewCustomerRow}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showHeader={false}
          showRegisterBtn={false}
        />


        {/* Customer Create Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto">
              <CustomerCreate
                vehicles={vehicles}
                onClose={handleCloseCreate}
                onSuccess={handleRegistrationSuccess}
                onError={setErrorMessage}
              />
            </div>
          </div>
        )}

        {/* ✅ Customer View Modal - ĐÃ THÊM onEditSuccess VÀ vehicles */}
        {viewVehicle && (
          <CustomerView
            vehicle={viewVehicle}
            customerDetail={customerDetail}
            campaignData={campaignData}
            loadingCustomer={loadingCustomer}
            loadingCampaign={loadingCampaign}
            activeDetailTab={activeDetailTab}
            onTabChange={setActiveDetailTab}
            onClose={handleCloseDetail}
            onEditSuccess={handleEditSuccessFromView} // refresh sau edit
            vehicles={vehicles}
          />
        )}


        {/* Customer Vehicles Modal */}
        {openCustomerVehicles && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {viewingCustomer?.name || "Customer Vehicles"}
                    </h3>
                    <p className="text-gray-600">
                      Customer ID: {viewingCustomer?.id} • {customerVehicles.length} vehicles
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setOpenCustomerVehicles(false);
                      setViewingCustomer(null);
                      setCustomerVehicles([]);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X size={24} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-0">
                {loadingCustomerVehicles ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading vehicles...</p>
                  </div>
                ) : customerVehicles.length === 0 ? (
                  <div className="p-12 text-center">
                    <Car size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No vehicles found</p>
                    <p className="text-gray-400">This customer doesn't have any registered vehicles yet.</p>
                  </div>
                ) : (
                  <div className="overflow-auto max-h-[60vh]">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="text-left text-gray-700">
                          <th className="px-8 py-4 font-semibold border-b border-gray-200">VIN</th>
                          <th className="px-8 py-4 font-semibold border-b border-gray-200">Model</th>
                          <th className="px-8 py-4 font-semibold border-b border-gray-200">License Plate</th>
                          <th className="px-8 py-4 font-semibold border-b border-gray-200">Purchase Date</th>
                          <th className="px-8 py-4 font-semibold border-b border-gray-200">Campaigns</th>
                          {/* 🔧 ADDED */}
                          <th className="px-8 py-4 font-semibold border-b border-gray-200 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {customerVehicles.map((v, idx) => (
                          <tr
                            key={v?.id ?? v?.vin ?? idx}
                            className="hover:bg-gray-50/80 transition-colors"
                          >
                            <td className="px-8 py-4 font-medium text-gray-900">
                              <code className="bg-gray-100 px-2 py-1 rounded-lg text-sm">
                                {v?.vin ?? "-"}
                              </code>
                            </td>
                            <td className="px-8 py-4">
                              <span className="font-medium text-gray-700">{v?.modelName ?? "-"}</span>
                            </td>
                            <td className="px-8 py-4">
                              {v?.licensePlate ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-sm">
                                  {v.licensePlate}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-8 py-4 text-gray-600">
                              {formatDateTuple(v?.purchaseDate)}
                            </td>
                            <td className="px-8 py-4">
                              {Array.isArray(v?.campaignNames) && v.campaignNames.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {v.campaignNames.map((name, i) => (
                                    <span
                                      key={`${name}-${i}`}
                                      className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 text-xs font-medium"
                                    >
                                      {name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>
                            {/* 🔧 ADDED: nút View để mở CustomerView (có Edit) */}
                            <td className="px-8 py-4 text-right">
                              <button
                                onClick={() => {
                                  setOpenCustomerVehicles(false);
                                  setViewingCustomer(null);
                                  setCustomerVehicles([]);
                                  handleViewVehicle(v); // 👉 mở CustomerView cho vehicle này
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                title="View vehicle details"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                  onClick={() => {
                    setOpenCustomerVehicles(false);
                    setViewingCustomer(null);
                    setCustomerVehicles([]);
                  }}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all duration-200"

                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerRegistration;
