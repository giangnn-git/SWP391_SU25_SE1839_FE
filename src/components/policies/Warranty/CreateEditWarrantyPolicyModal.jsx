import React from "react";
import {
  X,
  Save,
  Plus,
  FileText,
  Calendar,
  Gauge,
  Shield,
  Tag,
} from "lucide-react";

const CreateEditWarrantyPolicyModal = ({
  showModal,
  editing,
  formData,
  actionLoading,
  onClose,
  onSave,
  onFormDataChange,
}) => {
  if (!showModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? "Edit Policy" : "New Policy"}
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                {editing
                  ? "Update warranty policy"
                  : "Create new warranty policy"}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Policy Code */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Tag size={14} className="text-green-500" />
                Policy Code *
              </label>
              <input
                type="text"
                placeholder="Enter policy code"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm disabled:bg-gray-100 disabled:opacity-50"
                value={formData.code}
                onChange={(e) => onFormDataChange("code", e.target.value)}
                disabled={actionLoading}
                required
              />
            </div>

            {/* Policy Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText size={14} className="text-gray-500" />
                Policy Name *
              </label>
              <input
                type="text"
                placeholder="Enter policy name"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm disabled:bg-gray-100 disabled:opacity-50"
                value={formData.name}
                onChange={(e) => onFormDataChange("name", e.target.value)}
                disabled={actionLoading}
                required
              />
            </div>

            {/* Policy Type  */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Shield size={14} className="text-green-500" />
                Policy Type *
              </label>
              <select
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm disabled:bg-gray-100 disabled:opacity-50"
                value={formData.type}
                onChange={(e) => onFormDataChange("type", e.target.value)}
                disabled={actionLoading}
                required
              >
                <option value="">Select policy type</option>
                <option value="NORMAL">NORMAL</option>
                <option value="PROMOTION">PROMOTION</option>
              </select>
            </div>

            {/* Duration Period */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar size={14} className="text-green-500" />
                Duration Period (months) *
              </label>
              <input
                type="number"
                placeholder="Enter duration in months"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm disabled:bg-gray-100 disabled:opacity-50"
                value={formData.durationPeriod}
                onChange={(e) =>
                  onFormDataChange(
                    "durationPeriod",
                    parseInt(e.target.value) || 0
                  )
                }
                disabled={actionLoading}
                min="1"
                required
              />
            </div>

            {/* Mileage Limit  */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Gauge size={14} className="text-blue-500" />
                Mileage Limit (km) *
              </label>
              <input
                type="number"
                placeholder="Enter mileage limit"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm disabled:bg-gray-100 disabled:opacity-50"
                value={formData.mileageLimit}
                onChange={(e) =>
                  onFormDataChange(
                    "mileageLimit",
                    parseInt(e.target.value) || 0
                  )
                }
                disabled={actionLoading}
                min="1"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText size={14} className="text-gray-500" />
                Description *
              </label>
              <textarea
                placeholder="Enter policy description"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm resize-none disabled:bg-gray-100 disabled:opacity-50"
                value={formData.description}
                onChange={(e) =>
                  onFormDataChange("description", e.target.value)
                }
                disabled={actionLoading}
                rows={3}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : editing ? (
                <>
                  <Save size={16} />
                  Update
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditWarrantyPolicyModal;
