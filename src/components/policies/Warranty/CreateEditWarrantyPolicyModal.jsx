import React from "react";

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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[460px] p-6 animate-fadeIn">
        <h2 className="text-lg font-semibold mb-4">
          {editing ? "Edit Warranty Policy" : "Add New Warranty Policy"}
        </h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Policy Name"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => onFormDataChange("name", e.target.value)}
            disabled={actionLoading}
          />

          <textarea
            placeholder="Description"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.description}
            onChange={(e) => onFormDataChange("description", e.target.value)}
            disabled={actionLoading}
            rows={3}
          />

          <input
            type="number"
            placeholder="Duration Period (months)"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.durationPeriod}
            onChange={(e) => onFormDataChange("durationPeriod", e.target.value)}
            disabled={actionLoading}
          />

          <input
            type="number"
            placeholder="Mileage Limit (km)"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.mileageLimit}
            onChange={(e) => onFormDataChange("mileageLimit", e.target.value)}
            disabled={actionLoading}
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition disabled:opacity-50"
            disabled={actionLoading}
          >
            {actionLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEditWarrantyPolicyModal;
