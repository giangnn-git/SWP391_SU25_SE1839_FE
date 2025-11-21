import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Calendar,
  FileText,
  CheckCircle2,
  Settings,
  Folder,
} from "lucide-react";
import {
  createPartPolicyApi,
  getPartPolicyCodesApi,
} from "../../../services/api.service";

const CreatePartPolicy = ({ showModal, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: "",
    partCode: "",
    policyCode: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableCodes, setAvailableCodes] = useState({
    categories: {}, // { categoryName: { partMap: { partCode: partName } } }
    policyMap: {}, // { policyCode: policyName }
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
          categories: data.categories || {},
          policyMap: data.policyMap || {},
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
      // Reset form when modal opens
      setFormData({
        category: "",
        partCode: "",
        policyCode: "",
        startDate: "",
        endDate: "",
      });
      setError("");
    }
  }, [showModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      // Reset partCode when category changes
      setFormData((prev) => ({
        ...prev,
        category: value,
        partCode: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.category ||
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
    const categoryName = formData.category;
    const partCodeDisplay =
      availableCodes.categories[categoryName]?.partMap[formData.partCode] ||
      formData.partCode;
    const policyCodeDisplay =
      availableCodes.policyMap[formData.policyCode] || formData.policyCode;

    setSubmissionData({
      ...policyData,
      categoryName,
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
        category: "",
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
        err.response?.data?.errorCode || // Ưu tiên lấy errorCode
        err.response?.data?.message || // Fallback đến message
        "Failed to add part policy";
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

  // Get available categories and parts based on selected category
  const categoryOptions = Object.keys(availableCodes.categories || {});
  const partOptions = formData.category
    ? Object.entries(
        availableCodes.categories[formData.category]?.partMap || {}
      ).map(([code, name]) => ({ code, name }))
    : [];

  // Convert policyMap object to array for dropdown options
  const policyOptions = Object.entries(availableCodes.policyMap || {}).map(
    ([code, name]) => ({
      code,
      name,
    })
  );

  // Confirmation Modal
  if (showConfirmation && submissionData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Policy
              </h3>
            </div>
            <button
              onClick={handleCancelConfirm}
              className="p-1 hover:bg-white rounded transition-colors text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <X size={18} />
            </button>
          </div>

          {/* Confirmation Content */}
          <div className="p-4">
            <div className="space-y-4 mb-4">
              <p className="text-sm text-gray-600 text-center">
                Please confirm the policy details:
              </p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                <div className="flex items-start justify-between">
                  <span className="font-medium text-gray-700 text-sm">
                    Category:
                  </span>
                  <span className="text-gray-900 font-medium text-right">
                    {submissionData.categoryName}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-medium text-gray-700 text-sm">
                    Part:
                  </span>
                  <div className="text-right">
                    <span className="font-mono text-blue-600 font-semibold block">
                      {submissionData.partCode}
                    </span>
                    <span className="text-xs text-gray-500 block mt-1">
                      {submissionData.partCodeDisplay}
                    </span>
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-medium text-gray-700 text-sm">
                    Policy:
                  </span>
                  <div className="text-right">
                    <span className="font-mono text-green-600 font-semibold block">
                      {submissionData.policyCode}
                    </span>
                    <span className="text-xs text-gray-500 block mt-1">
                      {submissionData.policyCodeDisplay}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 text-sm">
                    Start Date:
                  </span>
                  <span className="text-gray-900 font-medium">
                    {submissionData.startDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 text-sm">
                    End Date:
                  </span>
                  <span className="text-gray-900 font-medium">
                    {submissionData.endDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Confirm
                  </>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Add Part Policy
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Create new part warranty policy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white rounded transition-colors text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Category Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Folder size={14} className="text-purple-500" />
                Category *
              </label>
              {codesLoading ? (
                <div className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-100 animate-pulse text-gray-500">
                  Loading categories...
                </div>
              ) : (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:opacity-50"
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Part Code Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText size={14} className="text-blue-500" />
                Part *
              </label>
              {codesLoading ? (
                <div className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-100 animate-pulse text-gray-500">
                  Loading parts...
                </div>
              ) : (
                <select
                  name="partCode"
                  value={formData.partCode}
                  onChange={handleChange}
                  required
                  disabled={loading || !formData.category}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:opacity-50"
                >
                  <option value="">
                    {formData.category
                      ? "Select Part"
                      : "Select category first"}
                  </option>
                  {partOptions.map((part) => (
                    <option key={part.code} value={part.code}>
                      {part.code} - {part.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Policy Code Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText size={14} className="text-green-500" />
                Policy *
              </label>
              {codesLoading ? (
                <div className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-100 animate-pulse text-gray-500">
                  Loading policies...
                </div>
              ) : (
                <select
                  name="policyCode"
                  value={formData.policyCode}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:opacity-50"
                >
                  <option value="">Select Policy</option>
                  {policyOptions.map((policy) => (
                    <option key={policy.code} value={policy.code}>
                      {policy.code} - {policy.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={14} className="text-blue-500" />
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={14} className="text-red-500" />
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-700 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || codesLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add Policy
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePartPolicy;
