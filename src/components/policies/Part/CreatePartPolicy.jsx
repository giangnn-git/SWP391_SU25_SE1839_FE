import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  createPartPolicyApi,
  getPartPolicyCodesApi,
} from "../../../services/api.service";

const CreatePartPolicy = ({ showModal, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    partCode: "",
    policyCode: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableCodes, setAvailableCodes] = useState({
    partCode: [],
    policyCode: [],
  });
  const [codesLoading, setCodesLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  // Fetch available part codes and policy codes
  useEffect(() => {
    const fetchAvailableCodes = async () => {
      try {
        setCodesLoading(true);
        const response = await getPartPolicyCodesApi();
        const data = response.data?.data || {};
        setAvailableCodes({
          partCode: data.partCode || [],
          policyCode: data.policyCode || [],
        });
      } catch (err) {
        console.error("Error fetching available codes:", err);
        setError("Failed to load available codes. Please try again.");
      } finally {
        setCodesLoading(false);
      }
    };

    if (showModal) {
      fetchAvailableCodes();
    }
  }, [showModal]);

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
      !formData.partCode ||
      !formData.policyCode ||
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

    // Prepare data for confirmation
    const policyData = {
      partCode: formData.partCode,
      policyCode: formData.policyCode,
      startDate: formData.startDate,
      endDate: formData.endDate,
    };

    // Get display names for confirmation
    const partCodeDisplay =
      availableCodes.partCode.find((code) => code === formData.partCode) ||
      formData.partCode;
    const policyCodeDisplay =
      availableCodes.policyCode.find((code) => code === formData.policyCode) ||
      formData.policyCode;

    setSubmissionData({
      ...policyData,
      partCodeDisplay,
      policyCodeDisplay,
    });
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      await createPartPolicyApi(submissionData);

      // Reset form
      setFormData({
        partCode: "",
        policyCode: "",
        startDate: "",
        endDate: "",
      });

      // Close confirmation and modal
      setShowConfirmation(false);

      // Notify parent
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add part policy";
      setError(errorMessage);
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmation(false);
    setSubmissionData(null);
  };

  if (!showModal) return null;

  // Confirmation Modal
  if (showConfirmation && submissionData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Confirm Part Policy</h3>
            <button
              onClick={handleCancelConfirm}
              className="text-gray-400 hover:text-gray-600 transition"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>

          {/* Confirmation Content */}
          <div className="p-6">
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600">
                Please confirm the following details:
              </p>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Part Code:</span>
                  <span>{submissionData.partCodeDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    Policy Code:
                  </span>
                  <span>{submissionData.policyCodeDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Start Date:</span>
                  <span>{submissionData.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">End Date:</span>
                  <span>{submissionData.endDate}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  "Confirm & Add"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Form Modal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Add Part Policy</h3>
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
            {/* Part Code Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Part Code *
              </label>
              {codesLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 animate-pulse">
                  Loading part codes...
                </div>
              ) : (
                <select
                  name="partCode"
                  value={formData.partCode}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select Part Code</option>
                  {availableCodes.partCode.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Policy Code Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Code *
              </label>
              {codesLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 animate-pulse">
                  Loading policy codes...
                </div>
              ) : (
                <select
                  name="policyCode"
                  value={formData.policyCode}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select Policy Code</option>
                  {availableCodes.policyCode.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              )}
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
              disabled={loading || codesLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                "Add Policy"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePartPolicy;
