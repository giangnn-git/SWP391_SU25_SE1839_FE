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
  const vinDropdownRef = useRef(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //  khi nhập tay VIN, chỉ ghi thẳng vào formData.vin, không bật dropdown
  const handleVinInputChange = (value) => {
    setVinSearch(value);
    setSelectedVin(value);
    setFormData((prev) => ({ ...prev, vin: value }));
    // Không mở dropdown nữa
    setShowVinDropdown(false);
  };

  const validateForm = () => {
    //  yêu cầu VIN dựa trên formData.vin (không dùng selectedVin)
    const requiredFields = {
      "Customer Name": formData.name,
      "Phone Number": formData.phoneNumber,
      "Vehicle VIN": formData.vin, // 🔧 CHANGED
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
      setError("Phone number must be 10 digits");
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

      //  dùng formData.vin trực tiếp khi create
      const submitData = {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim().replace(/\D/g, ""),
        licensePlate: formData.licensePlate.trim(),
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        vin: isEditMode ? editCustomer.vin : formData.vin.trim(), // 🔧 CHANGED
      };

      console.log("Submitting data:", submitData);

      if (isEditMode) {
        await updateCustomerApi(editCustomer.id, submitData);
      } else {
        await createCustomerApi(submitData);
      }

      const updatedPayload = {
        id: editCustomer?.id ?? null,
        vin: isEditMode ? editCustomer.vin : submitData.vin,
        licensePlate: submitData.licensePlate,
        name: submitData.name,
        phoneNumber: submitData.phoneNumber,
        email: submitData.email || "",
        address: submitData.address || "",
      };
      onSuccess && onSuccess(updatedPayload);

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

      let errorMsg = `Failed to ${
        isEditMode ? "update" : "register"
      } customer: `;

      if (err.response?.data) {
        const responseData = err.response.data;
        if (responseData.errorCode) {
          errorMsg += responseData.errorCode;
        } else if (responseData.message) {
          errorMsg += responseData.message;
        } else {
          errorMsg += "Please check your data and try again.";
        }
        if (responseData.details) {
          errorMsg += ` Details: ${responseData.details}`;
        }
      } else if (err.request) {
        errorMsg += "Cannot connect to server. Please try again later.";
      } else {
        errorMsg += "Unexpected error occurred.";
      }

      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Đóng dropdown khi click ngoài – vẫn giữ, nhưng dropdown không còn hiển thị
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

          {/*  VIN Field  */}
          <div className="space-y-2" ref={vinDropdownRef}>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle VIN *
            </label>
            <div className="relative">
              {isEditMode ? (
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
                <>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    {/*  input VIN nhập tay, không mở dropdown */}
                    <input
                      type="text"
                      name="vin"
                      value={formData.vin}
                      onChange={(e) => handleVinInputChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter VIN (e.g. VF8A1234567890001)"
                      required
                    />
                    {/*  bỏ nút Chevron mở dropdown */}
                    {/* <button
                      type="button"
                      onClick={() => setShowVinDropdown(!showVinDropdown)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronDown size={20} />
                    </button> */}
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {isEditMode
                ? "VIN cannot be changed after registration"
                : "Enter VIN manually. Example: VF8A1234567890001"}
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
