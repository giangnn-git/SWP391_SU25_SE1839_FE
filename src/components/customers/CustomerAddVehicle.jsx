import React, { useState, useRef, useEffect } from "react";
import { X, Car, FileText, Search, Plus } from "lucide-react";
import { addVehicleToCustomerApi } from "../../services/api.service";
import toast from "react-hot-toast";

const AddVehicleModal = ({ customer, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    vin: "",
    licensePlate: "",
  });
  const [vinSearch, setVinSearch] = useState("");
  const [showVinDropdown, setShowVinDropdown] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loading, setLoading] = useState(false);

  const vinDropdownRef = useRef(null);

  // Filter vehicles based on search
  const filteredVins = availableVehicles.filter(
    (vehicle) =>
      vehicle.vin?.toLowerCase().includes(vinSearch.toLowerCase()) ||
      vehicle.modelName?.toLowerCase().includes(vinSearch.toLowerCase()) ||
      (vehicle.licensePlate &&
        vehicle.licensePlate.toLowerCase().includes(vinSearch.toLowerCase()))
  );

  const handleVinSelect = (vehicle) => {
    setFormData((prev) => ({
      ...prev,
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate || "",
    }));
    setVinSearch(vehicle.vin);
    setShowVinDropdown(false);
  };

  // NHẬP TAY VIN: chỉ cập nhật state, KHÔNG mở dropdown
  const handleVinInputChange = (value) => {
    setVinSearch(value);
    setFormData((prev) => ({ ...prev, vin: value }));
    setShowVinDropdown(false);
  };

  // Validate license plate format
  const validateLicensePlate = (licensePlate) => {
    if (!licensePlate || licensePlate.trim() === "") return true;
    const licensePlateRegex = /^[0-9]{2}[A-Z]{1}-[0-9]{3}\.[0-9]{2}$/;
    return licensePlateRegex.test(licensePlate.trim());
  };

  const validateForm = () => {
    // Required VIN
    if (!formData.vin.trim()) {
      toast.error("VIN is required");
      return false;
    }

    // VIN nhập tay: kiểm tra tối thiểu độ dài/định dạng cơ bản
    const vinTrim = formData.vin.trim();
    if (vinTrim.length < 5) {
      toast.error("VIN must be at least 5 characters long");
      return false;
    }

    // Validate license plate format
    if (formData.licensePlate && !validateLicensePlate(formData.licensePlate)) {
      toast.error("Wrong License plate format.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        vin: formData.vin.trim(),
        licensePlate: formData.licensePlate.trim() || null,
      };

      console.log("Adding vehicle to customer:", customer.id, submitData);

      await addVehicleToCustomerApi(customer.id, submitData);

      onSuccess();

      // Reset form
      setFormData({ vin: "", licensePlate: "" });
      setVinSearch("");
    } catch (err) {
      console.error("Add vehicle error:", err);

      let errorMsg = "Failed to add vehicle: ";

      if (err.response?.data) {
        const responseData = err.response.data;
        if (responseData.errorCode) {
          errorMsg += responseData.errorCode;
        } else if (responseData.message) {
          errorMsg += responseData.message;
        } else {
          errorMsg += "Please check your data and try again.";
        }
      } else if (err.request) {
        errorMsg += "Cannot connect to server. Please try again later.";
      } else {
        errorMsg += "Unexpected error occurred.";
      }

      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="text-green-600" size={20} />
            Add Vehicle to Customer
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Customer Info */}
        <div className="p-6 border-b border-gray-100 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="text-blue-600" size={16} />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{customer.name}</div>
              <div className="text-sm text-gray-600">ID: {customer.id}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* XÓA HẲN PHẦN ERROR MESSAGE INLINE CŨ */}

          {/* VIN Field – NHẬP TAY */}
          <div className="space-y-2" ref={vinDropdownRef}>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle VIN *
            </label>
            <div className="relative">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={vinSearch}
                  onChange={(e) => handleVinInputChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter VIN (e.g. VF8A1234567890001)"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">Enter VIN manually</p>
          </div>

          {/* License Plate Field */}
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
                value={formData.licensePlate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    licensePlate: e.target.value,
                  }))
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g. 63A-003.33"
              />
            </div>
            <p className="text-xs text-gray-500">
              Format: 63A-003.33 (2 digits, 1 letter, dash, 3 digits, dot, 2
              digits)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              {loading ? "Adding..." : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;
