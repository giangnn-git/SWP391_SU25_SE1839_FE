import React from "react";

const PartPolicyModal = ({
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
          {editing ? "Edit Part Policy" : "Add New Part Policy"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Part Name
            </label>
            <input
              type="text"
              placeholder="Enter part name"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.partName}
              onChange={(e) => onFormDataChange("partName", e.target.value)}
              disabled={actionLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Policy ID
            </label>
            <input
              type="text"
              placeholder="Enter policy ID"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.policyId}
              onChange={(e) => onFormDataChange("policyId", e.target.value)}
              disabled={actionLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.startDate}
              onChange={(e) => onFormDataChange("startDate", e.target.value)}
              disabled={actionLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.endDate}
              onChange={(e) => onFormDataChange("endDate", e.target.value)}
              disabled={actionLoading}
            />
          </div>
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

export default PartPolicyModal;
