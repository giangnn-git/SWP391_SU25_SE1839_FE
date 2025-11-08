import {
  Eye,
  X,
  Calendar,
  Gauge,
  FileText,
  Shield,
  Clock,
  Tag,
  Layers,
  CheckCircle,
  XCircle,
} from "lucide-react";

const ViewWarrantyPolicyModal = ({ showModal, selectedPolicy, onClose }) => {
  if (!showModal || !selectedPolicy) return null;

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    return `${duration} months`;
  };

  const formatMileage = (mileage) => {
    if (!mileage) return "N/A";
    return `${mileage.toLocaleString()} km`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Policy Details
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white rounded transition-colors text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Policy Code */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-gray-500" />
              <h3 className="font-medium text-gray-900 text-sm">Policy Code</h3>
            </div>
            <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-900 font-medium">
              {selectedPolicy.code || "N/A"}
            </div>
          </div>

          {/* Policy Type */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers size={16} className="text-gray-500" />
              <h3 className="font-medium text-gray-900 text-sm">Policy Type</h3>
            </div>
            <div className="p-2 bg-gray-50 border border-gray-200 rounded">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedPolicy.policyType === "PROMOTION"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {selectedPolicy.policyType || "NORMAL"}
              </span>
            </div>
          </div>

          {/* Policy Name */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-gray-500" />
              <h3 className="font-medium text-gray-900 text-sm">Policy Name</h3>
            </div>
            <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-900 font-medium">
              {selectedPolicy.name}
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {selectedPolicy.status === "ACTIVE" ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <XCircle size={16} className="text-gray-500" />
              )}
              <h3 className="font-medium text-gray-900 text-sm">Status</h3>
            </div>
            <div className="p-2 bg-gray-50 border border-gray-200 rounded">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedPolicy.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {selectedPolicy.status || "INACTIVE"}
              </span>
            </div>
          </div>

          {/* Duration & Mileage Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Duration Period */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-green-500" />
                <h3 className="font-medium text-gray-900 text-sm">Duration</h3>
              </div>
              <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                <Clock size={14} className="text-green-500" />
                <span className="text-gray-900 font-medium">
                  {formatDuration(selectedPolicy.durationPeriod)}
                </span>
              </div>
            </div>

            {/* Mileage Limit */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gauge size={14} className="text-blue-500" />
                <h3 className="font-medium text-gray-900 text-sm">Mileage</h3>
              </div>
              <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                <Gauge size={14} className="text-blue-500" />
                <span className="text-gray-900 font-medium">
                  {formatMileage(selectedPolicy.mileageLimit)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-gray-500" />
              <h3 className="font-medium text-gray-900 text-sm">Description</h3>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm min-h-[80px]">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                {selectedPolicy.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewWarrantyPolicyModal;
