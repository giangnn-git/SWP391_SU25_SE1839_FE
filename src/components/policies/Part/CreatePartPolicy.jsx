// src/components/partPolicy/CreatePartPolicy.jsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { createPartPolicyApi } from "../../../services/api.service";

const CreatePartPolicy = ({ showModal, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    partId: "",
    warrantyPolicyId: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.partId ||
      !formData.warrantyPolicyId ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setError("Please fill in all fields!");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("End date must be after start date!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare data for API
      const policyData = {
        partId: parseInt(formData.partId),
        warrantyPolicyId: parseInt(formData.warrantyPolicyId),
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      await createPartPolicyApi(policyData);

      // Reset form
      setFormData({
        partId: "",
        warrantyPolicyId: "",
        startDate: "",
        endDate: "",
      });

      // Notify parent
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create part policy";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Create Part Policy</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Part ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Part ID *
              </label>
              <input
                type="number"
                name="partId"
                value={formData.partId}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter part ID"
                min="1"
              />
            </div>

            {/* Warranty Policy ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warranty Policy ID *
              </label>
              <input
                type="number"
                name="warrantyPolicyId"
                value={formData.warrantyPolicyId}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter warranty policy ID"
                min="1"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Policy"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePartPolicy;
