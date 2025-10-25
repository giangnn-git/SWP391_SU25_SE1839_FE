import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import CustomerCreate from "../components/customers/CustomerCreateAndUpdate";
import CustomerManagement from "../components/customers/CustomerManagement";
import CustomerView from "../components/customers/CustomerView";
import {
  getAllVehiclesApi,
  getCustomerByVinApi,
  getCampaignByVinApi,
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

  // Messages
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await getAllVehiclesApi();
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

  // Fetch customer details for all registered vehicles
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

  // Fetch customer detail for specific VIN
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

  // Fetch campaign data for specific VIN
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

  // Handle view vehicle details
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

  // Close detail modal
  const handleCloseDetail = () => {
    setViewVehicle(null);
    setCustomerDetail(null);
    setCampaignData(null);
  };

  // MỞ MODAL EDIT
  const handleEditCustomer = (customerData) => {
    if (customerData && customerData.id) {
      setEditCustomer(customerData);
    } else {
      console.warn("Invalid customer data for editing:", customerData);
    }
  };

  // FUNCTION XỬ LÝ THÀNH CÔNG CHO CREATE
  const handleRegistrationSuccess = async () => {
    setShowForm(false);
    setSuccessMessage("Customer registered successfully!");

    // TỰ ĐỘNG REFRESH DATA
    await fetchVehicles();

    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  // FUNCTION XỬ LÝ THÀNH CÔNG CHO EDIT
  const handleEditSuccess = async () => {
    setEditCustomer(null);
    setSuccessMessage("Customer updated successfully!");

    //TỰ ĐỘNG REFRESH DATA
    await fetchVehicles();

    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  // FUNCTION XỬ LÝ LỖI
  const handleEditError = (error) => {
    setErrorMessage(error || "Failed to update customer. Please try again.");

    setTimeout(() => {
      setErrorMessage("");
    }, 5000);
  };

  // ĐÓNG MODAL EDIT
  const handleCloseEdit = () => {
    setEditCustomer(null);
    setErrorMessage("");
  };

  // Clear messages khi đóng create modal
  const handleCloseCreate = () => {
    setShowForm(false);
    setErrorMessage("");
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* THÔNG BÁO SUCCESS/ERROR */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              {successMessage}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              {errorMessage}
            </div>
          </div>
        )}

        {/* Customer Management Component */}
        <CustomerManagement
          vehicles={vehicles}
          customersMap={customersMap}
          loading={loading}
          onShowForm={() => setShowForm(true)}
          onViewVehicle={handleViewVehicle}
          onEditCustomer={handleEditCustomer}
        />

        {/* Customer Create Modal */}
        {showForm && (
          <CustomerCreate
            vehicles={vehicles}
            onClose={handleCloseCreate}
            onSuccess={handleRegistrationSuccess}
            onError={setErrorMessage}
          />
        )}

        {/* CUSTOMER EDIT MODAL */}
        {editCustomer && (
          <CustomerCreate
            vehicles={vehicles}
            onClose={handleCloseEdit}
            onSuccess={handleEditSuccess}
            onError={setErrorMessage}
            editCustomer={editCustomer}
          />
        )}

        {/* Customer View Modal */}
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
          />
        )}
      </div>
    </div>
  );
};

export default CustomerRegistration;
