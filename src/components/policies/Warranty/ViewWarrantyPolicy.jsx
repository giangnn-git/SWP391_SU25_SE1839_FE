import { Eye } from "lucide-react";

const ViewWarrantyPolicyModal = ({ showModal, selectedPolicy, onClose }) => {
  if (!showModal || !selectedPolicy) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[480px] p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye size={20} className="text-gray-700" />
          Warranty Policy Details
        </h2>

        <div className="space-y-3 text-gray-700">
          <p>
            <b>Name:</b> {selectedPolicy.name}
          </p>
          <p>
            <b>Duration Period:</b> {selectedPolicy.durationPeriod}
          </p>
          <p>
            <b>Mileage Limit:</b> {selectedPolicy.mileageLimit}
          </p>
          <p>
            <b>Description:</b>
            <br />
            <span className="block mt-1 text-gray-600">
              {selectedPolicy.description}
            </span>
          </p>
          {selectedPolicy.originalData && (
            <p className="text-xs text-gray-500 mt-4">
              Policy ID: {selectedPolicy.originalData.id}
            </p>
          )}
        </div>

        <div className="flex justify-end mt-6">
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

export default ViewWarrantyPolicyModal;
