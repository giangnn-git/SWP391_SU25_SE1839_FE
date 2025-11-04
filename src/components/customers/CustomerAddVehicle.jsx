import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Car,
  FileText,
  Check,
  Search,
  ChevronDown,
  Plus,
} from "lucide-react";
import {
  getAllVehiclesApi,
  addVehicleToCustomerApi,
} from "../../services/api.service";

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
  const [error, setError] = useState("");
  const vinDropdownRef = useRef(null);

  // Fetch available vehicles (chưa đăng ký)
  const fetchAvailableVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const res = await getAllVehiclesApi();
      const allVehicles = res.data?.data?.vehicles || [];

      const available = allVehicles.filter(
        (vehicle) => vehicle.customerName === "N/A" || !vehicle.customerName
      );

      setAvailableVehicles(available);
    } catch (err) {
      console.error("Error fetching available vehicles:", err);
      setError("Failed to load available vehicles");
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    fetchAvailableVehicles();
  }, []);

  // Filter vehicles based on search (giữ nguyên để không phá code khác)
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
      licensePlate: vehicle.licensePlate || "", // Auto-fill license plate nếu có
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

  // Validate license plate format (giống CustomerCreate)
  const validateLicensePlate = (licensePlate) => {
    if (!licensePlate || licensePlate.trim() === "") return true; // Optional field
    const licensePlateRegex = /^[0-9]{2}[A-Z]{1}-[0-9]{3}\.[0-9]{2}$/;
    return licensePlateRegex.test(licensePlate.trim());
  };

  const validateForm = () => {
    // Required VIN
    if (!formData.vin.trim()) {
      setError("VIN is required");
      return false;
    }

    // VIN nhập tay: kiểm tra tối thiểu độ dài/định dạng cơ bản
    const vinTrim = formData.vin.trim();
    if (vinTrim.length < 5) {
      setError("VIN must be at least 5 characters long");
      return false;
    }
    // (Tuỳ chọn) chặt chẽ hơn:
    // const vinOk = /^[A-HJ-NPR-Z0-9]{5,17}$/i.test(vinTrim);
    // if (!vinOk) {
    //   setError("VIN format looks invalid");
    //   return false;
    // }

    // Validate license plate format
    if (formData.licensePlate && !validateLicensePlate(formData.licensePlate)) {
      setError("Wrong License plate format. Correct format: 63A-003.33");
      return false;
    }

    // BỎ ràng buộc: VIN phải thuộc availableVehicles (để cho phép nhập tay)
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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

      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside (giữ — dropdown hiện đã bị ẩn)
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
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

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
                {/* Bỏ nút Chevron để không mở dropdown */}
                {/* <button
                  type="button"
                  onClick={() => setShowVinDropdown(!showVinDropdown)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronDown size={20} />
                </button> */}
              </div>

              {/* Ẩn hẳn dropdown (giữ code nhưng không render) */}
              {false && showVinDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loadingVehicles ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Loading available vehicles...
                    </div>
                  ) : filteredVins.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      <Car size={20} className="mx-auto mb-1 text-gray-300" />
                      No available vehicles found
                    </div>
                  ) : (
                    filteredVins.map((vehicle) => (
                      <div
                        key={vehicle.vin}
                        onClick={() => handleVinSelect(vehicle)}
                        className={`px-4 py-3 cursor-pointer transition-colors hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${formData.vin === vehicle.vin ? "bg-blue-50" : ""
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 font-mono text-sm">
                              {vehicle.vin}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                              <span>{vehicle.modelName}</span>
                              <span>•</span>
                              <span>{vehicle.productYear}</span>
                              {vehicle.licensePlate && (
                                <>
                                  <span>•</span>
                                  <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                                    {vehicle.licensePlate}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {formData.vin === vehicle.vin && (
                            <Check
                              size={16}
                              className="text-blue-600 flex-shrink-0"
                            />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Enter VIN manually
            </p>
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
