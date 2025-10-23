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
} from "lucide-react"; //
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

  const availableVehicles = vehicles.filter((v) => v.customerName === "N/A");
  const isEditMode = Boolean(editCustomer);

  //  CHỈ HIỂN THỊ AVAILABLE VEHICLES CHO CREATE MODE
  const filteredVins = isEditMode
    ? []
    : availableVehicles.filter(
        (vehicle) =>
          vehicle.vin?.toLowerCase().includes(vinSearch.toLowerCase()) ||
          vehicle.modelName?.toLowerCase().includes(vinSearch.toLowerCase())
      );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVinSelect = (vin) => {
    setSelectedVin(vin);
    setVinSearch(vin);
    setShowVinDropdown(false);
    setFormData((prev) => ({ ...prev, vin })); //
  };

  const handleVinInputChange = (value) => {
    setVinSearch(value);
    setSelectedVin(value);
    setFormData((prev) => ({ ...prev, vin: value })); //
    if (!isEditMode) {
      setShowVinDropdown(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //  IMPROVED VALIDATION
    const requiredFields = {
      "Customer Name": formData.name,
      "Phone Number": formData.phoneNumber,
      "Vehicle VIN": selectedVin || formData.vin,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      setError(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const submitData = {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        licensePlate: formData.licensePlate.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        vin: isEditMode ? editCustomer.vin : selectedVin,
      };

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
      setError(
        `Failed to ${isEditMode ? "update" : "register"} customer: ${
          err.response?.data?.message || "Please try again."
        }`
      );
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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

          {/* VIN Field - CẢI THIỆN CHO EDIT MODE */}
          <div className="space-y-2" ref={vinDropdownRef}>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle VIN *
            </label>
            <div className="relative">
              {isEditMode ? (
                //  DISPLAY MODE CHO EDIT
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
                // 🔥 EDIT MODE CHO CREATE
                <>
                  <input
                    type="text"
                    value={vinSearch}
                    onChange={(e) => handleVinInputChange(e.target.value)}
                    onFocus={() => setShowVinDropdown(true)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                </>
              )}

              {/* Dropdown chỉ hiển thị trong create mode */}
              {showVinDropdown && !isEditMode && (
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
