import React, { useState, useEffect } from "react";
import {
  Eye,
  Package,
  Hash,
  Calendar,
  Folder,
  Gauge,
  FileText,
  Loader,
} from "lucide-react";
import { getPartPolicyByIdApi } from "../../../services/api.service";
import toast from "react-hot-toast";

const ViewPartPolicyModal = ({ showModal, selectedPolicy, onClose }) => {
  const [policyDetail, setPolicyDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Fallback to original string if error
    }
  };

  useEffect(() => {
    if (showModal && selectedPolicy) {
      fetchPolicyDetail();
    }
  }, [showModal, selectedPolicy]);

  const fetchPolicyDetail = async () => {
    if (!selectedPolicy?.id) return;

    setLoading(true);

    try {
      const response = await getPartPolicyByIdApi(selectedPolicy.id);
      setPolicyDetail(response.data?.data);
    } catch (err) {
      console.error("Error fetching policy detail:", err);
      toast.error("Failed to load policy details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal || !selectedPolicy) return null;

  const isActive = new Date(selectedPolicy.endDate) >= new Date();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Eye size={20} className="text-gray-700" />
            Part Policy Details
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader size={24} className="animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Loading policy details...</span>
            </div>
          ) : policyDetail ? (
            <div className="space-y-4">
              {/* Basic Info from List */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Policy Status</p>
                  <p
                    className={`font-medium ${
                      isActive ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {isActive ? "Active" : "Expired"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coverage Period</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedPolicy.startDate)} -{" "}
                    {formatDate(selectedPolicy.endDate)}
                  </p>
                </div>
              </div>

              {/* Detailed Information from API */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Package size={18} className="text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Part Name</p>
                    <p className="font-medium text-gray-900">
                      {policyDetail.partName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Folder size={18} className="text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Part Category</p>
                    <p className="font-medium text-gray-900">
                      {policyDetail.partCategory}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={18} className="text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Duration Period</p>
                    <p className="font-medium text-gray-900">
                      {policyDetail.durationPeriod} months
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Gauge size={18} className="text-orange-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Mileage Limit</p>
                    <p className="font-medium text-gray-900">
                      {policyDetail.mileageLimit?.toLocaleString()} km
                    </p>
                  </div>
                </div>

                {policyDetail.description && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText size={18} className="text-gray-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {policyDetail.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No detailed information available.
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPartPolicyModal;
