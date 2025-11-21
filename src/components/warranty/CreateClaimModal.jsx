import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import axios from "../../services/axios.customize";
import toast from "react-hot-toast";



const CreateClaimModal = ({ onClose, onClaimCreated }) => {
  // Form data for creating a claim
  const initialFormData = {
    description: "",
    mileage: "",
    phone: "",
    vin: "",
    priority: "NORMAL",
    agreeRecall: false,
    // diagnosis/defectiveParts/attachments are not collected at creation
  };

  // Form data state
  const [formData, setFormData] = useState(initialFormData);

  const isFormDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  // Supporting states
  const [vehicles, setVehicles] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [recallInfo, setRecallInfo] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmExit, setShowConfirmExit] = useState(false);


  // categories/parts are not needed for initial claim creation


  // Fetch vehicle list by customer phone
  const fetchVehiclesByPhone = async () => {
    if (!formData.phone?.trim()) {
      toast.error("Please enter customer phone");
      return;
    }

    try {
      const res = await axios.get(`/api/api/claims/vehicle/${formData.phone}`);
      const data = res.data?.data;

      const list = Array.isArray(data)
        ? data.map((item) => ({
          vehicle: item.vehicle,
          recall: item.code
            ? {
              code: item.code,
              name: item.name,
              description: item.description,
              startDate: item.startDate,
              endDate: item.endDate,
              status: item.status,
            }
            : null,
        }))
        : [];

      if (list.length === 0) {
        toast.error("No vehicles found for this phone number");
      } else {
        toast.success("Vehicles fetched successfully");
      }

      console.log("Fetched vehicles:", list);

      setVehicles(list);
      setRecallInfo(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.errorCode ||
        err.response?.data?.message ||
        "Failed to fetch vehicles";
      toast.error(errorMessage);
      setVehicles([]);
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.mileage) newErrors.mileage = "Mileage is required";
    if (!formData.vin.trim()) newErrors.vin = "VIN is required";
    // diagnosis/defective parts are not required at create time

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create claim
  const handleCreateClaim = async () => {
    if (!validateForm()) return;

    try {
      setActionLoading(true);

      const claimObj = {
        description: formData.description,
        mileage: parseInt(formData.mileage),
        vin: formData.vin,
        status: formData.status || "PENDING",
        priority: formData.priority || "NORMAL",
        agreeRecall: Boolean(formData.agreeRecall),
      };

      const fd = new FormData();
      fd.append("claim", new Blob([JSON.stringify(claimObj)], { type: "application/json" }));

      const res = await axios.post("/api/api/claims", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { status, data } = res;

      const isSuccess = (status === 200 || status === 201) && data?.data;

      if (isSuccess) {
        toast.success(data?.message || "Claim created successfully!");
        // Backend returns ApiResponse.data = CreateClaimResponse
        onClaimCreated(data.data);
        setSuccessMessage(data?.message || "Claim created successfully!");
        setShowSuccessModal(true);
      } else {
        toast.error(data?.errorCode || data?.message || "Unknown error");
      }


    } catch (err) {
      console.error("Create claim error:", err);
      const data = err.response?.data;
      const message = data?.errorCode || data?.message || "Failed to create claim. Please try again.";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Close Modal
  const handleClose = () => {
    if (isFormDirty()) {
      setShowConfirmExit(true);
    } else {
      onClose();
    }
  };




  // Handle general input change
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // (file/part handlers removed   not collected during initial claim creation)

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-6 border-b border-gray-200 bg-white shadow-sm">

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create New Claim
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Fill in the details below
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
          >
            <span className="text-2xl leading-none"> </span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Mileage and Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mileage (km) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter mileage..."
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${errors.mileage
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
                  }`}
                value={formData.mileage}
                onChange={(e) => handleInputChange("mileage", e.target.value)}
              />
              {errors.mileage && (
                <p className="text-red-600 text-xs mt-1">{errors.mileage}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Customer Phone <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter phone..."
                  className="flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition border-gray-300"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
                <button
                  type="button"
                  onClick={fetchVehiclesByPhone}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Vehicle Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Vehicle (VIN - License Plate){" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full px-4 py-2.5 border rounded-lg transition ${errors.vin ? "border-red-300 bg-red-50" : "border-gray-300"
                } ${!formData.phone?.trim()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "focus:ring-2 focus:ring-blue-500"
                }`}
              value={formData.vin}
              disabled={!formData.phone?.trim() || vehicles.length === 0}
              onChange={(e) => {
                const selectedVin = e.target.value;
                handleInputChange("vin", selectedVin);

                const selectedItem = vehicles.find(
                  (v) => v.vehicle.vin === selectedVin
                );

                if (selectedItem?.recall) {
                  setRecallInfo(selectedItem.recall);
                } else {
                  setRecallInfo(null);
                }
              }}
            >
              {!formData.phone?.trim() ? (
                <option value="">Enter phone first to select vehicle</option>
              ) : vehicles.length > 0 ? (
                <>
                  <option value="">Choose vehicle</option>
                  {vehicles.map((item, i) => (
                    <option key={i} value={item.vehicle.vin}>
                      {item.vehicle.vin} - {item.vehicle.licensePlate}
                    </option>
                  ))}
                </>
              ) : (
                <option value="">No vehicles found</option>
              )}
            </select>

            {errors.vin && (
              <p className="text-red-600 text-xs mt-1">{errors.vin}</p>
            )}
          </div>

          {/* Recall */}
          {recallInfo && (
            <div className="p-3 border rounded-md bg-yellow-50 mb-3">
              <h4 className="font-semibold text-yellow-700">
                This vehicle is under a Recall campaign.: {recallInfo.name} (
                {recallInfo.code})
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {recallInfo.description}
              </p>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.agreeRecall}
                  onChange={(e) =>
                    setFormData({ ...formData, agreeRecall: e.target.checked })
                  }
                />
                <span>Agree to participate in Recall</span>
              </label>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Priority
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
            >
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter claim description..."
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${errors.description
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
                }`}
              rows="3"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
            {errors.description && (
              <p className="text-red-600 text-xs mt-1">{errors.description}</p>
            )}
          </div>
          {/* Diagnosis/Parts/Attachments are not collected during initial claim creation */}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            className="px-6 py-2.5 border border-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition"
            onClick={handleClose}
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
            onClick={handleCreateClaim}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Loader size={18} className="animate-spin" /> Processing...
              </>
            ) : (
              "Create Claim"
            )}
          </button>
        </div>
      </div>
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            onClose();
          }}
        />

      )}

      {showConfirmExit && (
        <ConfirmExitModal
          onCancel={() => setShowConfirmExit(false)}
          onConfirm={() => {
            setShowConfirmExit(false);
            onClose();
          }}
        />
      )}

    </div>
  );
};

const SuccessModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-sm text-center">
        <h3 className="text-2xl font-semibold text-green-600 mb-3">Success!</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const ConfirmExitModal = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[60] p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center relative">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Unsaved Changes</h3>
      <p className="text-gray-600 mb-6">
        You have unsaved changes. Are you sure you want to discard them?
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Continue Editing
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Discard Changes
        </button>
      </div>
    </div>
  </div>
);



export default CreateClaimModal;
