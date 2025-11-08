import { useState, useEffect } from "react";
import { X, Plus, Image as ImageIcon, Loader, XCircle } from "lucide-react";
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
    diagnosis: "",
    defectiveParts: [{ category: "", partId: "" }],
    attachments: [],
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
  const [categories, setCategories] = useState([]);
  const [partsByCategory, setPartsByCategory] = useState({});
  const [recallInfo, setRecallInfo] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmExit, setShowConfirmExit] = useState(false);


  // Fetch categories when the modal loads
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/api/categories', {
          params: { vin: formData.vin }
        });
        setCategories(res.data.data.category || []);
        setPartsByCategory({});
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    if (formData.vin) {
      fetchCategories();
    }
  }, [formData.vin]);


  // Fetch parts by category if not already cached
  const fetchParts = async (category, vin) => {
    if (!category || partsByCategory[category]) return;
    try {
      const res = await axios.get(`/api/api/parts/${category}`, {
        params: { vin: vin }
      });
      setPartsByCategory((prev) => ({
        ...prev,
        [category]: res.data.data.partList || [],
      }));
    } catch (err) {
      console.error("Failed to fetch parts:", err);
    }
  };


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
      console.error("Failed to fetch vehicles:", err);
      toast.error("Failed to fetch vehicles");
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
    if (!formData.diagnosis.trim()) newErrors.diagnosis = "Diagnosis is required";

    const hasValidPart = formData.defectiveParts.some(
      (p) => p.partId && p.category
    );
    if (!hasValidPart)
      newErrors.defectiveParts = "Please select at least one defective part";

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
        diagnosis: formData.diagnosis,
        mileage: parseInt(formData.mileage),
        vin: formData.vin,
        agreeRecall: formData.agreeRecall,
        priority: formData.priority,
        defectivePartIds: formData.defectiveParts
          .filter((p) => p.partId)
          .map((p) => parseInt(p.partId)),
      };

      const fd = new FormData();
      fd.append("claim", new Blob([JSON.stringify(claimObj)], { type: "application/json" }));
      formData.attachments.forEach((file) => fd.append("attachments", file));

      const res = await axios.post("/api/api/claims", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { status, data } = res;

      if (status === 201 || data?.status === "201 CREATED" || data?.data?.success === "success") {
        toast.success(data?.data?.message || data?.message || "Claim created successfully!");
        onClaimCreated(data?.data?.claim);
        setSuccessMessage(data?.data?.message || data?.message || "Claim created successfully!");
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



  // Handle file upload
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const updatedFiles = [...formData.attachments, ...newFiles];
    setFormData({ ...formData, attachments: updatedFiles });
  };

  // Remove uploaded image
  const handleRemoveImage = (index) => {
    const updated = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: updated });
  };

  // Handle general input change
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Handle part info change
  const handlePartChange = (idx, field, value) => {
    const newParts = [...formData.defectiveParts];
    newParts[idx][field] = value;

    if (field === "category") {
      newParts[idx].partId = "";
      fetchParts(value, formData.vin);
    }

    setFormData({ ...formData, defectiveParts: newParts });
  };

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
            <X size={24} />
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

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Diagnosis <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter diagnosis..."
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${errors.diagnosis ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
              rows="2"
              value={formData.diagnosis}
              onChange={(e) => handleInputChange("diagnosis", e.target.value)}
            />
            {errors.diagnosis && (
              <p className="text-red-600 text-xs mt-1">{errors.diagnosis}</p>
            )}
          </div>

          {/* Defective Parts */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Defective Parts <span className="text-red-500">*</span>
            </label>

            {formData.defectiveParts.map((p, idx) => (
              <div key={idx} className="grid grid-cols-11 gap-2 mb-3">
                {/* Category */}
                <select
                  className="col-span-5 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={p.category}
                  onChange={(e) => handlePartChange(idx, "category", e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Part */}
                <select
                  className="col-span-5 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={p.partId}
                  onChange={(e) => handlePartChange(idx, "partId", e.target.value)}
                  disabled={!p.category}
                >
                  <option value="">Select Part</option>
                  {(partsByCategory[p.category] || []).map((part) => (
                    <option key={part.id} value={part.id}>
                      {part.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    const updatedParts = formData.defectiveParts.filter(
                      (_, i) => i !== idx
                    );
                    setFormData({ ...formData, defectiveParts: updatedParts });
                  }}
                  disabled={formData.defectiveParts.length === 1}
                  className="col-span-1 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition disabled:opacity-40"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {errors.defectiveParts && (
              <p className="text-red-600 text-xs mt-1">{errors.defectiveParts}</p>
            )}

            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  defectiveParts: [
                    ...formData.defectiveParts,
                    { category: "", partId: "" },
                  ],
                })
              }
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 mt-2"
            >
              <Plus size={14} /> Add Part
            </button>
          </div>


          {/* Attachments */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Attachments
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition">
              <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold"
              >
                Choose Files
              </label>
              <p className="text-gray-500 text-sm">
                or drag and drop images here
              </p>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {formData.attachments.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mt-4 mb-3">
                  {formData.attachments.length} file(s) selected
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition"
                      >
                        <div className="bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                          <X size={16} />
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
