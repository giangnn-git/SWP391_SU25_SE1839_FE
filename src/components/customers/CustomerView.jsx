import React from "react";
import {
  X,
  Eye,
  Car,
  FileText,
  Shield,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const CustomerView = ({
  vehicle,
  customerDetail,
  campaignData,
  loadingCustomer,
  loadingCampaign,
  activeDetailTab,
  onTabChange,
  onClose,
}) => {
  const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "N/A";
    const [year, month, day] = dateArray;
    return `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${year}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="text-blue-600" size={20} />
            Vehicle & Customer Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Vehicle Summary */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
            <Car className="text-blue-600" size={24} />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-lg">
                {vehicle.vin}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                <span>
                  {vehicle.modelName} • {vehicle.productYear}
                </span>
                {vehicle.licensePlate && (
                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                    <FileText size={14} />
                    {vehicle.licensePlate}
                  </span>
                )}
              </div>
              {campaignData && (
                <div className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                  <Shield size={14} />
                  Active Campaign: {campaignData.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => onTabChange("customer")}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeDetailTab === "customer"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              👤 Customer Information
            </button>
            <button
              onClick={() => onTabChange("warranty")}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeDetailTab === "warranty"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              🛡️ Warranty & Campaigns
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-96">
          {/* Customer Information Tab */}
          {activeDetailTab === "customer" && (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="text-green-600" size={18} />
                Customer Details
              </h3>

              {loadingCustomer ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Loading customer details...
                  </span>
                </div>
              ) : customerDetail ? (
                <div className="space-y-3 bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="text-gray-500" size={16} />
                    <span className="text-gray-600 font-medium w-20">
                      Name:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {customerDetail.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="text-gray-500" size={16} />
                    <span className="text-gray-600 font-medium w-20">
                      Phone:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {customerDetail.phoneNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="text-gray-500" size={16} />
                    <span className="text-gray-600 font-medium w-20">
                      Email:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {customerDetail.email}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="text-gray-500 mt-0.5" size={16} />
                    <span className="text-gray-600 font-medium w-20">
                      Address:
                    </span>
                    <span className="font-semibold text-gray-900 flex-1">
                      {customerDetail.address}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                  <User className="mx-auto mb-2 text-gray-400" size={24} />
                  <p>No customer details found</p>
                </div>
              )}
            </div>
          )}

          {/* Warranty & Campaigns Tab */}
          {activeDetailTab === "warranty" && (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="text-orange-600" size={18} />
                Warranty Campaign
              </h3>

              {loadingCampaign ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Loading campaign details...
                  </span>
                </div>
              ) : campaignData ? (
                <div className="space-y-4">
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg mb-1">
                          {campaignData.name}
                        </div>
                        {campaignData.code && (
                          <div className="text-sm text-gray-600">
                            Code: {campaignData.code}
                          </div>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle size={12} className="mr-1" />
                        Active
                      </span>
                    </div>

                    {campaignData.description && (
                      <div className="text-sm text-gray-700 mb-4 p-3 bg-white rounded-lg border">
                        {campaignData.description}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-gray-600 font-medium">
                            Campaign Period:
                          </span>
                        </div>
                        <div className="ml-6 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start:</span>
                            <span className="font-medium">
                              {formatDate(campaignData.startDate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">End:</span>
                            <span className="font-medium">
                              {formatDate(campaignData.endDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-gray-600 font-medium">
                            Production Period:
                          </span>
                        </div>
                        <div className="ml-6 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">From:</span>
                            <span className="font-medium">
                              {formatDate(campaignData.produceDateFrom)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">To:</span>
                            <span className="font-medium">
                              {formatDate(campaignData.produceDateTo)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                  <AlertCircle
                    className="mx-auto mb-2 text-gray-400"
                    size={24}
                  />
                  <p className="font-medium">No active campaign found</p>
                  <p className="text-sm mt-1">
                    This vehicle is not part of any warranty campaign
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerView;
