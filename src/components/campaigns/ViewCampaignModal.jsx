import React, { useState } from "react";
import { sendCampaignNotificationApi } from "../../services/api.service";
import {
  X,
  Calendar,
  Car,
  Hash,
  AlertTriangle,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  Loader,
} from "lucide-react";

const ViewCampaignModal = ({ campaign, onClose }) => {
  const [isSending, setIsSending] = useState(false);
  const [notificationResult, setNotificationResult] = useState(null);

  if (!campaign) return null;

  // Format số vehicles
  const formatVehicles = (count) => {
    return count?.toLocaleString() || "0";
  };

  // Get status config
  const getStatusConfig = (status) => {
    const configs = {
      ACTIVE: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle2 size={16} />,
        label: "Active",
      },
      UPCOMING: {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: <Clock size={16} />,
        label: "Upcoming",
      },
      COMPLETED: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <CheckCircle2 size={16} />,
        label: "Completed",
      },
    };
    return configs[status] || configs.UPCOMING;
  };

  // Hàm gửi thông báo
  const handleSendNotification = async () => {
    if (campaign.totalVehicles <= 0) {
      setNotificationResult({
        type: "error",
        message:
          "Cannot send notification: No vehicles affected by this campaign",
      });
      return;
    }

    setIsSending(true);
    setNotificationResult(null);

    try {
      const response = await sendCampaignNotificationApi(campaign.id);

      if (response.status === 200) {
        const successMessage =
          response.data.message ||
          "Notification sent successfully to all affected customers";

        setNotificationResult({
          type: "success",
          message: successMessage, // Hiển thị message từ BE
        });
      }
    } catch (error) {
      console.error("Notification error:", error);

      //   Lấy message lỗi từ BE response nếu có
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errorCode?.includes(
          "Unresolved compilation problems"
        )
          ? "Notification service is temporarily unavailable. Please try again later."
          : "Failed to send notification. Please contact support.";

      setNotificationResult({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSending(false);
    }
  };

  const statusConfig = getStatusConfig(campaign.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle size={24} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                Campaign Details
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full border flex items-center gap-1 ${statusConfig.color}`}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Complete information about this campaign
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Notification Result */}
            {notificationResult && (
              <div
                className={`p-4 rounded-lg border ${
                  notificationResult.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {notificationResult.type === "success" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                  <span className="font-medium">
                    {notificationResult.message}
                  </span>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Campaign Code & Name */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash size={18} className="text-gray-500" />
                    <h3 className="font-semibold text-gray-900">
                      Campaign Identification
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Campaign Code
                      </label>
                      <div className="p-3 bg-white border border-gray-300 rounded-lg font-mono text-lg font-semibold text-blue-600">
                        {campaign.code}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Campaign Name
                      </label>
                      <div className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium">
                        {campaign.name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campaign Period */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={18} className="text-gray-500" />
                    <h3 className="font-semibold text-gray-900">
                      Campaign Period
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <div className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-center font-medium">
                          {campaign.formattedStartDate}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <div className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-center font-medium">
                          {campaign.formattedEndDate}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Production Range */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Car size={18} className="text-gray-500" />
                    <h3 className="font-semibold text-gray-900">
                      Affected Production Range
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Production From
                        </label>
                        <div className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-center font-medium">
                          {campaign.formattedProduceFrom}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Production To
                        </label>
                        <div className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-center font-medium">
                          {campaign.formattedProduceTo}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicles Impact */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={18} className="text-gray-500" />
                    <h3 className="font-semibold text-gray-900">
                      Vehicles Impact
                    </h3>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatVehicles(campaign.totalVehicles)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Vehicles Affected
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Vehicles produced between {campaign.formattedProduceFrom}{" "}
                      and {campaign.formattedProduceTo}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={18} className="text-gray-500" />
                <h3 className="font-semibold text-gray-900">
                  Campaign Description
                </h3>
              </div>
              <div className="p-4 bg-white border border-gray-300 rounded-lg min-h-[100px]">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {campaign.description ||
                    "No description provided for this campaign."}
                </p>
              </div>
            </div>

            {/* Campaign Status & Timeline */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-gray-500" />
                <h3 className="font-semibold text-gray-900">
                  Campaign Timeline
                </h3>
              </div>

              <div className="flex items-center justify-between relative px-4">
                {/* Timeline line */}
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-300 transform -translate-y-1/2 z-0"></div>

                {/* Timeline steps */}
                <div className="flex items-center justify-between w-full relative z-10">
                  {/* Production Period */}
                  <div className="text-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        campaign.status === "COMPLETED" ||
                        campaign.status === "ACTIVE" ||
                        campaign.status === "UPCOMING"
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      <Car size={16} />
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      Production
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {campaign.formattedProduceFrom}
                    </div>
                  </div>

                  {/* Campaign Start */}
                  <div className="text-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        campaign.status === "COMPLETED" ||
                        campaign.status === "ACTIVE"
                          ? "bg-orange-500 text-white"
                          : campaign.status === "UPCOMING"
                          ? "bg-orange-200 text-orange-600"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      <Calendar size={16} />
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      Campaign Start
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {campaign.formattedStartDate}
                    </div>
                  </div>

                  {/* Campaign End */}
                  <div className="text-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        campaign.status === "COMPLETED"
                          ? "bg-blue-500 text-white"
                          : campaign.status === "ACTIVE"
                          ? "bg-blue-200 text-blue-600"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      Campaign End
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {campaign.formattedEndDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Updated với button Send Notification */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            {campaign.totalVehicles > 0 ? (
              <span className="flex items-center gap-1">
                <Users size={16} />
                Ready to notify {formatVehicles(campaign.totalVehicles)}{" "}
                affected customer(s)
              </span>
            ) : (
              <span className="text-orange-600 flex items-center gap-1">
                <AlertTriangle size={16} />
                No vehicles to notify
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSendNotification}
              disabled={isSending || campaign.totalVehicles <= 0}
              className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                campaign.totalVehicles > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSending ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={18} />
                  Send Notification
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCampaignModal;
