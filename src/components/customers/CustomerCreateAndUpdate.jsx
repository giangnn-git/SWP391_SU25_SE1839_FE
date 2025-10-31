import React, { useState, useRef, useEffect } from "react";
import {
  UserPlus,
  X,
  User,
  Phone,
  FileText,
  Mail,
  MapPin,
  ChevronDown,
  Check,
  Save,
  Lock,
  Search,
  Car,
} from "lucide-react";
import {
  createCustomerApi,
  updateCustomerApi,
  getAllVehiclesApi, // ✅ THÊM API NÀY
} from "../../services/api.service";

const CustomerCreate = ({
  vehicles,
  onClose,
  onSuccess,
  onError,
  editCustomer = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    licensePlate: "",
    email: "",
    address: "",
    vin: "",
  });
  const [vinSearch, setVinSearch] = useState("");
  const [showVinDropdown, setShowVinDropdown] = useState(false);
  const [selectedVin, setSelectedVin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]); // ✅ STATE MỚI
  const [loadingVehicles, setLoadingVehicles] = useState(false); // ✅ LOADING STATE
  const vinDropdownRef = useRef(null);

  // ✅ HÀM FETCH AVAILABLE VEHICLES
  const fetchAvailableVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const res = await getAllVehiclesApi();
      const allVehicles = res.data?.data?.vehicles || [];

      // Lọc chỉ những vehicles chưa đăng ký (customerName là "N/A")
      const available = allVehicles.filter(vehicle =>
        vehicle.customerName === "N/A" || !vehicle.customerName
      );

      setAvailableVehicles(available);
    } catch (err) {
      console.error("Error fetching available vehicles:", err);
      // Không cần hiển thị lỗi cho user, chỉ log
    } finally {
      setLoadingVehicles(false);
    }
  };

  // ✅ FETCH KHI COMPONENT MOUNT (CHỈ TRONG CREATE MODE)
  useEffect(() => {
    if (!editCustomer) {
      fetchAvailableVehicles();
    }
  }, [editCustomer]);

  // NẠP DỮ LIỆU KHI EDIT
  useEffect(() => {
    if (editCustomer) {
      setFormData({
        name: editCustomer.name || "",
        phoneNumber: editCustomer.phoneNumber || "",
        licensePlate: editCustomer.licensePlate || "",
        email: editCustomer.email || "",
        address: editCustomer.address || "",
        vin: editCustomer.vin || "",
      });
      setSelectedVin(editCustomer.vin || "");
      setVinSearch(editCustomer.vin || "");
    }
  }, [editCustomer]);

  const isEditMode = Boolean(editCustomer);

  // ✅ FILTER VEHICLES DỰA TRÊN SEARCH TERM
  const filteredVins = availableVehicles.filter(
    (vehicle) =>
      vehicle.vin?.toLowerCase().includes(vinSearch.toLowerCase()) ||
      vehicle.modelName?.toLowerCase().includes(vinSearch.toLowerCase()) ||
      (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(vinSearch.toLowerCase()))
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVinSelect = (vehicle) => {
    setSelectedVin(vehicle.vin);
    setVinSearch(vehicle.vin);
    setShowVinDropdown(false);
    setFormData((prev) => ({
      ...prev,
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate || prev.licensePlate // ✅ TỰ ĐỘNG ĐIỀN LICENSE PLATE
    }));
  };

  const handleVinInputChange = (value) => {
    setVinSearch(value);
    setSelectedVin(value);
    setFormData((prev) => ({ ...prev, vin: value }));
    if (!isEditMode) {
      setShowVinDropdown(true);
    }
  };

  const validateForm = () => {
    // Kiểm tra required fields
    const requiredFields = {
      "Customer Name": formData.name,
      "Phone Number": formData.phoneNumber,
      "Vehicle VIN": selectedVin || formData.vin,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim() === "")
      .map(([field]) => field);

    if (missingFields.length > 0) {
      setError(`Please fill all required fields: ${missingFields.join(", ")}`);
      return false;
    }

    // Validate phone number (chỉ số, 10-11 ký tự)
    const phoneRegex = /^[0-9]{10,11}$/;
    const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      setError("Phone number must be 10-11 digits");
      return false;
    }

    // Validate license plate format: 63A-003.33
    if (formData.licensePlate && formData.licensePlate.trim() !== "") {
      const licensePlateRegex = /^[0-9]{2}[A-Z]{1}-[0-9]{3}\.[0-9]{2}$/;
      if (!licensePlateRegex.test(formData.licensePlate.trim())) {
        setError("Wrong License plate format");
        return false;
      }
    }

    // Validate email format (nếu có email)
    if (formData.email && formData.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
      }
    }

    // Validate VIN format (nếu cần)
    if (formData.vin && formData.vin.length < 5) {
      setError("VIN must be at least 5 characters long");
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
      setError("");

      // Chuẩn bị data theo đúng format BE expect
      const submitData = {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim().replace(/\D/g, ""), // Chỉ giữ số
        licensePlate: formData.licensePlate.trim(),
        email: formData.email.trim() || null, // Gửi null nếu empty
        address: formData.address.trim() || null, // Gửi null nếu empty
        vin: isEditMode
          ? editCustomer.vin
          : (selectedVin || formData.vin).trim(),
      };

      console.log("Submitting data:", submitData); // Debug log

      if (isEditMode) {
        await updateCustomerApi(editCustomer.id, submitData);
      } else {
        await createCustomerApi(submitData);
      }

      onSuccess();

      // Reset form chỉ khi không phải edit mode
      if (!isEditMode) {
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
      }
    } catch (err) {
      console.error("Customer operation error:", err);

      let errorMsg = `Failed to ${isEditMode ? "update" : "register"
        } customer: `;

      // ƯU TIÊN HIỂN THỊ errorCode TRƯỚC, SAU ĐÓ MỚI ĐẾN message HOẶC FALLBACK
      if (err.response?.data) {
        const responseData = err.response.data;

        // ƯU TIÊN 1: Hiển thị errorCode nếu có
        if (responseData.errorCode) {
          errorMsg += responseData.errorCode;
        }
        // ƯU TIÊN 2: Hiển thị message nếu không có errorCode
        else if (responseData.message) {
          errorMsg += responseData.message;
        }
        // FALLBACK: Thông báo mặc định
        else {
          errorMsg += "Please check your data and try again.";
        }

        // Hiển thị chi tiết lỗi từ BE nếu có
        if (responseData.details) {
          errorMsg += ` Details: ${responseData.details}`;
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

  // Đóng dropdown khi click outside
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {isEditMode ? (
              <Save className="text-blue-600" size={20} />
            ) : (
              <UserPlus className="text-blue-600" size={20} />
            )}
            {isEditMode ? "Update Customer" : "Register New Customer"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <div className="flex items-center gap-2">
                <X size={16} />
                {error}
              </div>
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
                  required
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
                  required
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
                  placeholder="e.g. 63A-003.33"
                />
              </div>
              <p className="text-xs text-gray-500">
                Format: 63A-003.33 (2 digits, 1 letter, dash, 3 digits, dot, 2
                digits)
              </p>
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
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="e.g. Hanoi, Vietnam"
                />
              </div>
            </div>
          </div>

          {/* ✅ VIN Field - ĐÃ ĐƯỢC CẢI THIỆN VỚI DROPDOWN ĐẦY ĐỦ */}
          <div className="space-y-2" ref={vinDropdownRef}>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle VIN *
            </label>
            <div className="relative">
              {isEditMode ? (
                // DISPLAY MODE CHO EDIT
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <Lock size={16} className="text-gray-400" />
                  <span className="font-mono text-gray-700">
                    {formData.vin}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    (Cannot be changed)
                  </span>
                </div>
              ) : (
                // EDIT MODE CHO CREATE
                <>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      value={vinSearch}
                      onChange={(e) => handleVinInputChange(e.target.value)}
                      onFocus={() => setShowVinDropdown(true)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Type VIN or select from available vehicles..."
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowVinDropdown(!showVinDropdown)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>
                </>
              )}

              {/* ✅ Dropdown chỉ hiển thị trong create mode - ĐÃ ĐƯỢC CẢI THIỆN */}
              {showVinDropdown && !isEditMode && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loadingVehicles ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Loading vehicles...
                    </div>
                  ) : filteredVins.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      <Car size={20} className="mx-auto mb-1 text-gray-300" />
                      No available vehicles found
                    </div>
                  ) : (
                    filteredVins.map((vehicle, index) => (
                      <div
                        key={vehicle.vin}
                        onClick={() => handleVinSelect(vehicle)}
                        className={`px-4 py-3 cursor-pointer transition-colors hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${selectedVin === vehicle.vin ? "bg-blue-50" : ""
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 font-mono">
                              {vehicle.vin}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                              <span>{vehicle.modelName}</span>
                              <span>•</span>
                              <span>{vehicle.productYear}</span>
                              {vehicle.licensePlate && (
                                <>
                                  <span>•</span>
                                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                    {vehicle.licensePlate}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {selectedVin === vehicle.vin && (
                            <Check size={16} className="text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {isEditMode
                ? "VIN cannot be changed after registration"
                : `${availableVehicles.length} available vehicles. Type to search or select from dropdown.`}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditMode ? <Save size={16} /> : <UserPlus size={16} />}
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Registering..."
                : isEditMode
                  ? "Update Customer"
                  : "Register Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerCreate;