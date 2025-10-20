import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  FileText,
  Calendar,
  Gauge,
  Shield,
  Tag,
  Layers,
} from "lucide-react";

const UpdateWarrantyPolicyModal = ({
  showModal,
  policy,
  actionLoading,
  onClose,
  onUpdated,
  updatePolicyApi,
}) => {
  const [formData, setFormData] = useState({
    code: "",
    policyType: "NORMAL",
    name: "",
    description: "",
    durationPeriod: "",
    mileageLimit: "",
  });

  useEffect(() => {
    if (policy) {
      setFormData({
        code: policy.code || "",
        policyType: policy.policyType || "NORMAL",
        name: policy.name || "",
        description: policy.description || "",
        durationPeriod:
          typeof policy.durationPeriod === "string"
            ? policy.durationPeriod.replace(" months", "")
            : policy.durationPeriod?.toString() || "",
        mileageLimit:
          typeof policy.mileageLimit === "string"
            ? policy.mileageLimit.replace(" km", "").replace(/,/g, "")
            : policy.mileageLimit?.toString() || "",
      });
    }
  }, [policy]);

  const handleFormDataChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isChanged =
    formData.code?.trim() !== (policy?.code || "").trim() ||
    formData.policyType?.trim() !== (policy?.policyType || "").trim() ||
    formData.name?.trim() !== (policy?.name || "").trim() ||
    formData.description?.trim() !== (policy?.description || "").trim() ||
    formData.durationPeriod?.toString() !==
      (policy?.durationPeriod?.toString().replace(" months", "") || "") ||
    formData.mileageLimit?.toString() !==
      (policy?.mileageLimit?.toString().replace(" km", "").replace(/,/g, "") ||
        "");

  // Gửi request update
  const handleSubmit = async () => {
    if (!policy?.id) {
      console.error("Invalid policy ID.");
      return;
    }

    if (
      !formData.code?.trim() ||
      !formData.policyType?.trim() ||
      !formData.name?.trim() ||
      !formData.description?.trim() ||
      !formData.durationPeriod ||
      !formData.mileageLimit
    ) {
      console.error("Please fill in all fields before saving.");
      return;
    }

    try {
      const apiData = {
        code: formData.code.trim(),
        policyType: formData.policyType.trim(), // ĐÃ SỬA
        name: formData.name.trim(),
        durationPeriod: parseInt(formData.durationPeriod),
        mileageLimit: parseInt(formData.mileageLimit),
        description: formData.description.trim(),
      };

      console.log("📤 Sending update data:", apiData); // Debug

      await updatePolicyApi(policy.id, apiData);

      if (onUpdated) onUpdated();
      onClose();
    } catch (error) {
      console.error(
        "Update failed:",
        error.response?.data?.message ||
          "Failed to update policy. Please try again."
      );
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Policy
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Update warranty policy details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white rounded transition-colors text-gray-500 hover:text-gray-700"
            disabled={actionLoading}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4 space-y-4">
          {/* Policy Code */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag size={14} className="text-gray-500" />
              Policy Code
            </label>
            <input
              type="text"
              placeholder="Enter policy code"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
              value={formData.code}
              onChange={(e) => handleFormDataChange("code", e.target.value)}
              disabled={actionLoading}
            />
          </div>

          {/* Policy Type   */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Layers size={14} className="text-gray-500" />
              Policy Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
              value={formData.policyType}
              onChange={(e) =>
                handleFormDataChange("policyType", e.target.value)
              }
              disabled={actionLoading}
            >
              <option value="">Select policy type</option>
              <option value="NORMAL">Normal</option>
              <option value="PROMOTION">Promotion</option>
            </select>
          </div>

          {/* Policy Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText size={14} className="text-gray-500" />
              Policy Name
            </label>
            <input
              type="text"
              placeholder="Enter policy name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
              value={formData.name}
              onChange={(e) => handleFormDataChange("name", e.target.value)}
              disabled={actionLoading}
            />
          </div>

          {/* Duration Period */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar size={14} className="text-green-500" />
              Duration Period (months)
            </label>
            <input
              type="number"
              placeholder="Enter duration in months"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
              value={formData.durationPeriod}
              onChange={(e) =>
                handleFormDataChange("durationPeriod", e.target.value)
              }
              disabled={actionLoading}
            />
          </div>

          {/* Mileage Limit */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Gauge size={14} className="text-blue-500" />
              Mileage Limit (km)
            </label>
            <input
              type="number"
              placeholder="Enter mileage limit"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
              value={formData.mileageLimit}
              onChange={(e) =>
                handleFormDataChange("mileageLimit", e.target.value)
              }
              disabled={actionLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText size={14} className="text-gray-500" />
              Description
            </label>
            <textarea
              placeholder="Enter policy description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm resize-none"
              value={formData.description}
              onChange={(e) =>
                handleFormDataChange("description", e.target.value)
              }
              disabled={actionLoading}
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm disabled:opacity-50"
            disabled={actionLoading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={actionLoading || !isChanged}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm transition-all duration-300 ${
              actionLoading
                ? "bg-gray-400 cursor-not-allowed"
                : isChanged
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {actionLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateWarrantyPolicyModal;
