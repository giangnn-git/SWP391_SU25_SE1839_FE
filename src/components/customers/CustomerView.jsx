import { useState, useEffect } from "react";
import {
  X,
  Car,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  History,
  Settings,
  ClipboardList,
  Cog,
  Users,
  ShieldCheck,
} from "lucide-react";
import CustomerCreate from "./CustomerCreateAndUpdate";
import toast from "react-hot-toast";
import { getRepairHistoryByVinApi } from "../../services/api.service";

const CustomerView = ({
  vehicle,
  customerDetail,
  campaignData,
  loadingCustomer,
  loadingCampaign,
  activeDetailTab,
  onTabChange,
  onClose,
  onEditSuccess,
  onEditError,
  vehicles,
}) => {
  const [activeTab, setActiveTab] = useState("view");
  const [editingCustomer, setEditingCustomer] = useState(null);

  // State mới cho repair history
  const [repairHistory, setRepairHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // HÀM FETCH REPAIR HISTORY
  const fetchRepairHistory = async (vin) => {
    if (!vin) return;

    try {
      setLoadingHistory(true);
      const response = await getRepairHistoryByVinApi(vin);
      setRepairHistory(response.data.data || []);
    } catch (err) {
      console.error("Error fetching repair history:", err);
      setRepairHistory([]);
      toast.error("Failed to load repair history");
    } finally {
      setLoadingHistory(false);
    }
  };

  // KHI VEHICLE THAY ĐỔI, FETCH HISTORY
  useEffect(() => {
    if (vehicle?.vin && activeDetailTab === "history") {
      fetchRepairHistory(vehicle.vin);
    }
  }, [vehicle?.vin, activeDetailTab]);

  // HÀM CHUYỂN SANG CHẾ ĐỘ EDIT
  const handleEdit = () => {
    if (customerDetail) {
      setEditingCustomer({
        id: customerDetail.id,
        name: customerDetail.name,
        phoneNumber: customerDetail.phoneNumber,
        email: customerDetail.email,
        address: customerDetail.address,
        vin: vehicle?.vin || "",
        licensePlate: vehicle?.licensePlate || "",
      });
      setActiveTab("edit");
    }
  };

  // HÀM QUAY LẠI CHẾ ĐỘ VIEW
  const handleBackToView = () => {
    setActiveTab("view");
    setEditingCustomer(null);
  };

  // HÀM XỬ LÝ KHI EDIT THÀNH CÔNG
  const handleEditSuccess = (updated) => {
    setActiveTab("view");
    setEditingCustomer(null);

    if (onEditSuccess) {
      onEditSuccess(updated);
    }
  };

  const handleEditErrorInView = (error) => {
    toast.error(error || "Failed to update customer. Please try again.");
    if (onEditError) {
      onEditError(error);
    }
  };

  const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "N/A";
    const [year, month, day] = dateArray;
    return `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${year}`;
  };

  // HÀM ĐỊNH DẠNG STATUS
  const formatStatus = (status) => {
    const statusMap = {
      WAITING: {
        label: "Waiting",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      PENDING: {
        label: "Pending",
        color: "bg-orange-100 text-orange-800 border-orange-200",
      },
      IN_PROGRESS: {
        label: "In Progress",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      },
      COMPLETED: {
        label: "Completed",
        color: "bg-green-100 text-green-800 border-green-200",
      },
      CANCELLED: {
        label: "Cancelled",
        color: "bg-red-100 text-red-800 border-red-200",
      },
    };

    return (
      statusMap[status] || {
        label: status,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      }
    );
  };

  // NẾU ĐANG Ở CHẾ ĐỘ EDIT, HIỂN THỊ FORM EDIT
  if (activeTab === "edit" && editingCustomer) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToView}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="text-blue-600" size={20} />
                Edit Customer
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <CustomerCreate
            vehicles={vehicles}
            onClose={handleBackToView}
            onSuccess={handleEditSuccess}
            onError={handleEditErrorInView}
            editCustomer={editingCustomer}
          />
        </div>
      </div>
    );
  }

  // CHẾ ĐỘ VIEW BÌNH THƯỜNG
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList className="text-blue-600" size={20} />
            Vehicle & Customer Details
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              disabled={loadingCustomer || !customerDetail}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                loadingCustomer || !customerDetail
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Settings size={16} />
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
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
              {campaignData && campaignData.length > 0 && (
                <div className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                  <ShieldCheck size={14} />
                  Active Campaigns: {campaignData.length} campaign(s) found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation - CẬP NHẬT ICON MỚI */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => onTabChange("customer")}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                activeDetailTab === "customer"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users size={16} />
              Customer Info
            </button>
            <button
              onClick={() => onTabChange("warranty")}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                activeDetailTab === "warranty"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <ShieldCheck size={16} />
              Warranty & Campaigns
            </button>
            <button
              onClick={() => onTabChange("history")}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                activeDetailTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <History size={16} />
              Repair History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1">
          {/* Customer Information Tab */}
          {activeDetailTab === "customer" && (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="text-green-600" size={18} />
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
                  <Users className="mx-auto mb-2 text-gray-400" size={24} />
                  <p>No customer details found</p>
                </div>
              )}
            </div>
          )}

          {/* Warranty & Campaigns Tab */}
          {activeDetailTab === "warranty" && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="text-orange-600" size={18} />
                Warranty Campaigns
              </h3>

              {loadingCampaign ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Loading campaign details...
                  </span>
                </div>
              ) : campaignData && campaignData.length > 0 ? (
                <div className="space-y-4">
                  {campaignData.map((campaign, index) => (
                    <div
                      key={campaign.campaignId || index}
                      className="bg-orange-50 rounded-xl p-4 border border-orange-200"
                    >
                      {/* Campaign Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-lg mb-1">
                            {campaign.campaignName}{" "}
                          </div>
                          {campaign.campaignCode && (
                            <div className="text-sm text-gray-600">
                              Code: {campaign.campaignCode}{" "}
                            </div>
                          )}
                          {/* Hiển thị campaign status */}
                          <div className="text-sm text-gray-600 mt-1">
                            Status: {campaign.status || "NOTIFIED"}
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle size={12} className="mr-1" />
                          Active
                        </span>
                      </div>

                      {/* Campaign Description */}
                      {campaign.description && (
                        <div className="text-sm text-gray-700 mb-4 p-3 bg-white rounded-lg border">
                          {campaign.description}
                        </div>
                      )}

                      {/* Campaign Dates */}
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
                                {formatDate(campaign.startDate)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">End:</span>
                              <span className="font-medium">
                                {formatDate(campaign.endDate)}
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
                                {formatDate(campaign.produceDateFrom)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">To:</span>
                              <span className="font-medium">
                                {formatDate(campaign.produceDateTo)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                  <ShieldCheck
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

          {/* Repair History Tab */}
          {activeDetailTab === "history" && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <History className="text-purple-600" size={18} />
                Repair History
              </h3>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Loading repair history...
                  </span>
                </div>
              ) : repairHistory.length > 0 ? (
                <div className="space-y-4">
                  {repairHistory.map((repair, index) => {
                    const statusInfo = formatStatus(repair.status);
                    return (
                      <div
                        key={repair.orderId || index}
                        className="bg-purple-50 rounded-xl p-4 border border-purple-200"
                      >
                        {/* Repair Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-lg mb-1">
                              Repair Order #{repair.orderId}
                            </div>
                            <div className="text-sm text-gray-600">
                              Mileage: {repair.claimMileage} km
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Repair Description */}
                        {repair.claimDescription && (
                          <div className="text-sm text-gray-700 mb-4 p-3 bg-white rounded-lg border">
                            <div className="font-medium text-gray-900 mb-1">
                              Description:
                            </div>
                            {repair.claimDescription}
                          </div>
                        )}

                        {/* Repair Details */}
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            <Cog size={14} />
                            Repair Parts:
                          </div>
                          {repair.details && repair.details.length > 0 ? (
                            <div className="space-y-2">
                              {repair.details.map((detail, detailIndex) => {
                                const detailStatus = formatStatus(
                                  detail.status
                                );
                                return (
                                  <div
                                    key={detailIndex}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">
                                        {detail.partName}
                                      </div>
                                      {detail.description && (
                                        <div className="text-sm text-gray-600 mt-1">
                                          {detail.description}
                                        </div>
                                      )}
                                    </div>
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${detailStatus.color}`}
                                    >
                                      {detailStatus.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 bg-white rounded-lg border">
                              No repair parts details available
                            </div>
                          )}
                        </div>

                        {/* Repair Dates - ĐÃ LOẠI BỎ SUPERVISOR APPROVED */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-purple-200">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-gray-600 font-medium">
                                Start Date:
                              </span>
                            </div>
                            <div className="ml-6">
                              <span className="font-medium">
                                {repair.startDate
                                  ? formatDate(repair.startDate)
                                  : "Not started"}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-gray-600 font-medium">
                                End Date:
                              </span>
                            </div>
                            <div className="ml-6">
                              <span className="font-medium">
                                {repair.endDate
                                  ? formatDate(repair.endDate)
                                  : "Not completed"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                  <History className="mx-auto mb-2 text-gray-400" size={24} />
                  <p className="font-medium">No repair history found</p>
                  <p className="text-sm mt-1">
                    This vehicle has no recorded repair orders
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
