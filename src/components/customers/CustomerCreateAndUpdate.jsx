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
  AlertCircle,
} from "lucide-react";
import {
  createCustomerApi,
  updateCustomerApi,
} from "../../services/api.service";
import ToastMessage from "../common/ToastMessage";

const CustomerCreate = ({
  vehicles,
  onClose,
  onSuccess,
  onError,
  editCustomer = null,
}) => {
  // State cho toast
  const [actionMessage, setActionMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    licensePlate: "",
    email: "",
    address: "",
    vin: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    phoneNumber: "",
    licensePlate: "",
    email: "",
    address: "",
    vin: "",
  });

  const [touchedFields, setTouchedFields] = useState({
    name: false,
    phoneNumber: false,
    licensePlate: false,
    email: false,
    address: false,
    vin: false,
  });

  const [vinSearch, setVinSearch] = useState("");
  const [showVinDropdown, setShowVinDropdown] = useState(false);
  const [selectedVin, setSelectedVin] = useState("");
  const [loading, setLoading] = useState(false);
  const vinDropdownRef = useRef(null);

  // Hàm hiển thị toast
  const showMessage = (message, type = "info") => {
    setActionMessage(message);
    setMessageType(type);
  };

  // Hàm validate từng field
  const validateField = (name, value) => {
    let error = "";

    // Regex patterns để kiểm tra ký tự đặc biệt
    const specialCharRegex = /[<>{}[\]\\^`~|]/; // Các ký tự đặc biệt nguy hiểm
    const sqlInjectionRegex =
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE)\b)|('|--|;)/i;

    switch (name) {
      case "name":
        if (!value || value.trim() === "") {
          error = "Customer name cannot be empty";
        } else if (
          specialCharRegex.test(value) ||
          sqlInjectionRegex.test(value)
        ) {
          error = "Name contains invalid special characters";
        } else if (value.length > 100) {
          error = "Name cannot exceed 100 characters";
        }
        break;

      case "phoneNumber":
        if (!value || value.trim() === "") {
          error = "Phone number cannot be empty";
        } else {
          const cleanPhone = value.replace(/\D/g, "");
          if (!/^[0-9]{10,11}$/.test(cleanPhone)) {
            error = "Phone number must be 10-11 digits";
          }
        }
        break;

      case "licensePlate":
        if (value && value.trim() !== "") {
          const licensePlateRegex = /^[0-9]{2}[A-Z]{1}-[0-9]{3}\.[0-9]{2}$/;
          if (!licensePlateRegex.test(value.trim())) {
            error = "Wrong license plate format (e.g., 63A-003.33)";
          }
        } else if (value && value.trim() === "") {
          // Không hiển thị lỗi nếu người dùng xóa hết và tab qua
          error = "";
        }
        break;

      case "email":
        if (value && value.trim() !== "") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = "Please enter a valid email address";
          } else if (
            specialCharRegex.test(value) ||
            sqlInjectionRegex.test(value)
          ) {
            error = "Email contains invalid characters";
          }
        } else if (value && value.trim() === "") {
          // Không hiển thị lỗi nếu người dùng xóa hết và tab qua
          error = "";
        }
        break;

      case "address":
        if (
          value &&
          (specialCharRegex.test(value) || sqlInjectionRegex.test(value))
        ) {
          error = "Address contains invalid special characters";
        } else if (value && value.length > 200) {
          error = "Address cannot exceed 200 characters";
        } else if (value && value.trim() === "") {
          // Không hiển thị lỗi nếu người dùng xóa hết và tab qua
          error = "";
        }
        break;

      case "vin":
        if (!value || value.trim() === "") {
          error = "VIN cannot be empty";
        } else if (
          specialCharRegex.test(value) ||
          sqlInjectionRegex.test(value)
        ) {
          error = "VIN contains invalid special characters";
        } else if (value.length < 5) {
          error = "VIN must be at least 5 characters long";
        } else if (value.length > 50) {
          error = "VIN cannot exceed 50 characters";
        }
        break;

      default:
        break;
    }

    return error;
  };

  // Hàm xử lý khi field bị blur (mất focus)
  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Đánh dấu field đã được chạm vào
    setTouchedFields((prev) => ({ ...prev, [name]: true }));

    // Validate field khi blur
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Hàm xử lý thay đổi input với real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation chỉ khi field đã được touched
    if (touchedFields[name]) {
      const error = validateField(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // khi nhập tay VIN, chỉ ghi thẳng vào formData.vin, không bật dropdown
  const handleVinInputChange = (value) => {
    setVinSearch(value);
    setSelectedVin(value);
    setFormData((prev) => ({ ...prev, vin: value }));
    setShowVinDropdown(false);

    // Validate VIN real-time chỉ khi field đã được touched
    if (touchedFields.vin) {
      const error = validateField("vin", value);
      setFieldErrors((prev) => ({ ...prev, vin: error }));
    }
  };

  // Hàm xử lý blur cho VIN input
  const handleVinBlur = () => {
    setTouchedFields((prev) => ({ ...prev, vin: true }));
    const error = validateField("vin", formData.vin);
    setFieldErrors((prev) => ({ ...prev, vin: error }));
  };

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

      // Clear errors và touched fields khi edit
      setFieldErrors({
        name: "",
        phoneNumber: "",
        licensePlate: "",
        email: "",
        address: "",
        vin: "",
      });
      setTouchedFields({
        name: false,
        phoneNumber: false,
        licensePlate: false,
        email: false,
        address: false,
        vin: false,
      });
    }
  }, [editCustomer]);

  const isEditMode = Boolean(editCustomer);

  const validateForm = () => {
    // Đánh dấu tất cả các field đã được touched khi submit
    const allTouched = Object.keys(touchedFields).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouchedFields(allTouched);

    // Validate tất cả các field
    const newErrors = {
      name: validateField("name", formData.name),
      phoneNumber: validateField("phoneNumber", formData.phoneNumber),
      licensePlate: validateField("licensePlate", formData.licensePlate),
      email: validateField("email", formData.email),
      address: validateField("address", formData.address),
      vin: validateField("vin", formData.vin),
    };

    setFieldErrors(newErrors);

    // Kiểm tra required fields
    const requiredFields = {
      "Customer Name": formData.name,
      "Phone Number": formData.phoneNumber,
      "Vehicle VIN": formData.vin,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim() === "")
      .map(([field]) => field);

    if (missingFields.length > 0) {
      showMessage(
        `Please fill all required fields: ${missingFields.join(", ")}`,
        "error"
      );
      return false;
    }

    // Kiểm tra xem có lỗi validation nào không
    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) {
      showMessage(
        "Please fix the validation errors before submitting",
        "error"
      );
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
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim().replace(/\D/g, ""),
        licensePlate: formData.licensePlate.trim(),
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        vin: isEditMode ? editCustomer.vin : formData.vin.trim(),
      };

      console.log("Submitting data:", submitData);

      if (isEditMode) {
        await updateCustomerApi(editCustomer.id, submitData);
        showMessage("Customer updated successfully!", "success");
      } else {
        await createCustomerApi(submitData);
        showMessage("Customer registered successfully!", "success");
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
        setFieldErrors({
          name: "",
          phoneNumber: "",
          licensePlate: "",
          email: "",
          address: "",
          vin: "",
        });
        setTouchedFields({
          name: false,
          phoneNumber: false,
          licensePlate: false,
          email: false,
          address: false,
          vin: false,
        });
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

      showMessage(errorMsg, "error");
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Đóng dropdown khi click ngoài
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

  // Component hiển thị lỗi
  const ErrorMessage = ({ message }) => {
    if (!message) return null;

    return (
      <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
        <AlertCircle size={12} />
        <span>{message}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      {/* Toast Message */}
      {actionMessage && (
        <ToastMessage
          type={messageType}
          message={actionMessage}
          onClose={() => setActionMessage("")}
        />
      )}

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
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
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    fieldErrors.name ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <ErrorMessage message={fieldErrors.name} />
            </div>

            {/* Phone Number */}
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
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    fieldErrors.phoneNumber
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  placeholder="e.g. 0901234567"
                  required
                />
              </div>
              <ErrorMessage message={fieldErrors.phoneNumber} />
            </div>

            {/* License Plate */}
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
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    fieldErrors.licensePlate
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  placeholder="e.g. 63A-003.33"
                />
              </div>
              <ErrorMessage message={fieldErrors.licensePlate} />
              <p className="text-xs text-gray-500">
                Format: 63A-003.33 (2 digits, 1 letter, dash, 3 digits, dot, 2
                digits)
              </p>
            </div>

            {/* Email Address */}
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
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    fieldErrors.email ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="example@email.com"
                />
              </div>
              <ErrorMessage message={fieldErrors.email} />
            </div>

            {/* Address */}
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
                  onBlur={handleBlur}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
                    fieldErrors.address ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="e.g. Hanoi, Vietnam"
                />
              </div>
              <ErrorMessage message={fieldErrors.address} />
            </div>
          </div>

          {/* VIN Field */}
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
                    <input
                      type="text"
                      name="vin"
                      value={formData.vin}
                      onChange={(e) => handleVinInputChange(e.target.value)}
                      onBlur={handleVinBlur}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        fieldErrors.vin ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="Enter VIN (e.g. VF8A1234567890001)"
                      required
                    />
                  </div>
                </>
              )}
            </div>
            <ErrorMessage message={fieldErrors.vin} />
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
