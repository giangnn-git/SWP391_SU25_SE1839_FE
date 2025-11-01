import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Eye,
  Info,
  Loader2,
  AlertCircle,
  Package,
  Calendar,
  Gauge,
  FileText,
  MoreVertical,
  Shield,
} from "lucide-react";
import { getVehicleDetailApi } from "../../services/api.service";
import { calculateWarrantyPeriod } from "../../utils/WarrantyCalculator";

// Format date function
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

// PolicyTooltip component
const PolicyTooltip = ({ partPolicy, activeTooltip }) => {
  if (!partPolicy || !activeTooltip) return null;

  const tooltipRef = useRef(null);

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-gray-50 text-gray-800 rounded-lg p-4 shadow-2xl w-80 animate-fadeIn border border-gray-200"
      style={{
        top: activeTooltip.y - 10,
        left: activeTooltip.x + 10,
        transform: "translateY(-100%)",
      }}
    >
      {/* Tooltip arrow */}
      <div className="absolute bottom-0 left-4 transform translate-y-full border-8 border-transparent border-t-gray-50"></div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
        <FileText size={16} className="text-blue-600" />
        <h4 className="font-semibold text-gray-900">{partPolicy.policyName}</h4>
      </div>

      {/* Content */}
      <div className="space-y-2 text-sm">
        <div>
          <p className="text-gray-600 text-xs leading-relaxed">
            {partPolicy.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-green-600" />
            <span className="text-gray-600">Duration:</span>
          </div>
          <span className="text-gray-900 font-medium">
            {partPolicy.durationPeriod} months
          </span>

          <div className="flex items-center gap-1">
            <Gauge size={14} className="text-yellow-600" />
            <span className="text-gray-600">Mileage:</span>
          </div>
          <span className="text-gray-900 font-medium">
            {partPolicy.mileageLimit?.toLocaleString()} km
          </span>

          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-blue-600" />
            <span className="text-gray-600">Start:</span>
          </div>
          <span className="text-gray-900 font-medium text-xs">
            {formatDate(partPolicy.startDate)}
          </span>

          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-red-600" />
            <span className="text-gray-600">End:</span>
          </div>
          <span className="text-gray-900 font-medium text-xs">
            {formatDate(partPolicy.endDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

const ViewVehicleModal = ({ vehicle, onClose }) => {
  const [vehicleDetail, setVehicleDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [warrantyPeriod, setWarrantyPeriod] = useState(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const fetchVehicleDetail = async () => {
      if (!vehicle?.id) return;

      try {
        setLoading(true);
        setError("");
        const response = await getVehicleDetailApi(vehicle.id);
        const data = response.data?.data || response.data;
        setVehicleDetail(data);

        // Tính toán warranty period
        if (data?.partPolicies) {
          const period = calculateWarrantyPeriod(data.partPolicies);
          setWarrantyPeriod(period);
          console.log("🛡️ Calculated warranty period:", period);
        }
      } catch (err) {
        console.error("Error fetching vehicle details:", err);
        setError("Failed to load vehicle details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetail();
  }, [vehicle?.id]);

  const handleThreeDotsClick = (partPolicy, index, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({
      index,
      partPolicy,
      x: rect.left,
      y: rect.top,
    });
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeTooltip &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target)
      ) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeTooltip]);

  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-h-[90vh] overflow-hidden animate-fadeIn border border-gray-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 pb-4">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Vehicle Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition"
          >
            <X size={18} className="text-gray-600 hover:text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Loading details...</span>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-gray-700">
              {/* Basic Info Section với Warranty */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Info size={16} />
                  Basic Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-blue-800">
                      Model Name:
                    </span>
                    <span className="text-blue-900">{vehicle.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-blue-800">
                      Release Year:
                    </span>
                    <span className="text-blue-900">{vehicle.releaseYear}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-800">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        vehicle.isInProduction
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-200 text-gray-600 border border-gray-300"
                      }`}
                    >
                      {vehicle.isInProduction
                        ? "In Production"
                        : "Discontinued"}
                    </span>
                  </div>

                  {/* WARRANTY PERIOD */}
                  {warrantyPeriod && warrantyPeriod.years > 0 && (
                    <div className="pt-2 border-t border-blue-200 mt-2 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-800 flex items-center gap-1">
                          <Shield size={14} />
                          Warranty Period:
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-semibold border border-green-200">
                          {warrantyPeriod.years}{" "}
                          {warrantyPeriod.years === 1 ? "year" : "years"}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-blue-700">
                        <span>
                          From: {formatDate(warrantyPeriod.startDate)}
                        </span>
                        <span>To: {formatDate(warrantyPeriod.endDate)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Part Policies Section */}
              {vehicleDetail?.partPolicies &&
                vehicleDetail.partPolicies.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Package size={16} className="text-purple-600" />
                      Part Policies ({vehicleDetail.partPolicies.length})
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        (Click ⋮ to see details)
                      </span>
                    </h3>

                    <div className="space-y-2">
                      {vehicleDetail.partPolicies.map((partPolicy, index) => (
                        <div
                          key={`${partPolicy.partId}-${partPolicy.policyId}-${index}`}
                          className="relative"
                        >
                          <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition group">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="font-medium text-gray-900">
                                {partPolicy.partName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {partPolicy.policyName}
                              </span>
                              <button
                                onClick={(e) =>
                                  handleThreeDotsClick(partPolicy, index, e)
                                }
                                className="p-1 rounded hover:bg-gray-200 transition text-gray-500 hover:text-purple-600"
                                title="View policy details"
                              >
                                <MoreVertical size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Description */}
              <div>
                <span className="font-medium block mb-2 text-gray-900">
                  Description:
                </span>
                <p className="text-gray-600 bg-gray-50 border border-gray-100 rounded-md p-3 text-sm leading-relaxed">
                  {vehicle.description || "No description provided."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* Render tooltip */}
      <PolicyTooltip
        partPolicy={activeTooltip?.partPolicy}
        activeTooltip={activeTooltip}
      />
    </div>
  );
};

export default ViewVehicleModal;
