import React, { useState } from "react";
import {
  X,
  Calendar,
  Car,
  FileText,
  Hash,
  AlertCircle,
  Plus,
  CheckCircle,
} from "lucide-react";
import { createCampaignApi } from "../../services/api.service";

const CreateCampaignModal = ({ isOpen, onClose, onCampaignCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    startDate: "",
    endDate: "",
    produceDateFrom: "",
    produceDateTo: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(""); // Thêm state cho success message

  // Format date từ yyyy-mm-dd sang [year, month, day] cho BE
  const formatDateForBE = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  };

  // Validate form - FIXED: Sửa lỗi so sánh date
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Campaign name is required";
    if (!formData.code.trim()) newErrors.code = "Campaign code is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.produceDateFrom)
      newErrors.produceDateFrom = "Production start date is required";
    if (!formData.produceDateTo)
      newErrors.produceDateTo = "Production end date is required";

    // Date validation - FIXED: Convert to Date object for comparison
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      newErrors.endDate = "End date must be after start date";
    }

    if (
      formData.produceDateFrom &&
      formData.produceDateTo &&
      new Date(formData.produceDateFrom) > new Date(formData.produceDateTo)
    ) {
      newErrors.produceDateTo =
        "Production end date must be after production start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSuccessMessage(""); // Clear previous success message

    try {
      // Format data for API - convert dates to [year, month, day] arrays
      const campaignData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        code: formData.code.trim().toUpperCase(),
        startDate: formatDateForBE(formData.startDate),
        endDate: formatDateForBE(formData.endDate),
        produceDateFrom: formatDateForBE(formData.produceDateFrom),
        produceDateTo: formatDateForBE(formData.produceDateTo),
      };

      console.log("Sending campaign data:", campaignData);

      const response = await createCampaignApi(campaignData);

      // Hiển thị success message
      setSuccessMessage("Campaign created successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        code: "",
        startDate: "",
        endDate: "",
        produceDateFrom: "",
        produceDateTo: "",
      });

      // Call success callback sau 2 giây để user thấy success message
      setTimeout(() => {
        if (onCampaignCreated) {
          onCampaignCreated(response.data);
        }
        onClose();
      }, 10000);
    } catch (error) {
      console.error("Error creating campaign:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          "Failed to create campaign. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate suggested campaign code
  const generateSuggestedCode = () => {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `CAM${currentYear}${randomNum}`;
  };

  // Auto-fill code when name is entered
  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: name,
    }));

    // Auto-generate code if empty
    if (!formData.code && name.trim()) {
      const baseCode = name
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 6)
        .toUpperCase();

      if (baseCode) {
        setFormData((prev) => ({
          ...prev,
          code:
            baseCode +
            Math.floor(Math.random() * 100)
              .toString()
              .padStart(2, "0"),
        }));
      }
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      code: "",
      startDate: "",
      endDate: "",
      produceDateFrom: "",
      produceDateTo: "",
    });
    setErrors({});
    setSuccessMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle size={24} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Campaign
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Add a new vehicle recall or service campaign
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm flex items-center gap-2">
                  <CheckCircle size={16} />
                  {successMessage}
                </p>
              </div>
            )}

            {/* Campaign Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-orange-600" />
                Campaign Information
              </h3>

              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter campaign name (e.g., VF8 Fuel Pump Recall)"
                  disabled={loading || !!successMessage}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Campaign Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Code *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-mono ${
                      errors.code
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g., VF2025"
                    disabled={loading || !!successMessage}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        code: generateSuggestedCode(),
                      }))
                    }
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap"
                    disabled={loading || !!successMessage}
                  >
                    Suggest Code
                  </button>
                </div>
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.code}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                  placeholder="Describe the campaign purpose, affected components, and required actions..."
                  disabled={loading || !!successMessage}
                />
              </div>
            </div>

            {/* Campaign Period */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={20} className="text-orange-600" />
                Campaign Period *
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.startDate
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    disabled={loading || !!successMessage}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.startDate}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.endDate
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    disabled={loading || !!successMessage}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Production Range */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Car size={20} className="text-orange-600" />
                Affected Production Range *
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Production Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Production Start Date
                  </label>
                  <input
                    type="date"
                    name="produceDateFrom"
                    value={formData.produceDateFrom}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.produceDateFrom
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    disabled={loading || !!successMessage}
                  />
                  {errors.produceDateFrom && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.produceDateFrom}
                    </p>
                  )}
                </div>

                {/* Production Date To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Production End Date
                  </label>
                  <input
                    type="date"
                    name="produceDateTo"
                    value={formData.produceDateTo}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.produceDateTo
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    disabled={loading || !!successMessage}
                  />
                  {errors.produceDateTo && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.produceDateTo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errors.submit}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              disabled={loading}
            >
              {successMessage ? "Close" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading || !!successMessage}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : successMessage ? (
                <>
                  <CheckCircle size={16} />
                  Success!
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignModal;
