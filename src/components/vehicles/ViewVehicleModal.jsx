import React from "react";
import { X, Eye, Info } from "lucide-react";

const ViewVehicleModal = ({ vehicle, onClose }) => {
    if (!vehicle) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-[2px]">
            <div className="bg-white rounded-2xl shadow-2xl w-[460px] p-6 animate-fadeIn border border-gray-100 relative">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Eye size={20} className="text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Vehicle Details</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition"
                    >
                        <X size={18} className="text-gray-600 hover:text-black" />
                    </button>
                </div>

                {/* Vehicle Info */}
                <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex justify-between">
                        <span className="font-medium">Model Name:</span>
                        <span>{vehicle.name}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="font-medium">Release Year:</span>
                        <span>{vehicle.releaseYear}</span>
                    </div>

                    <div>
                        <span className="font-medium block mb-1">Description:</span>
                        <p className="text-gray-600 bg-gray-50 border border-gray-100 rounded-md p-2 text-sm">
                            {vehicle.description || "No description provided."}
                        </p>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-medium">Status:</span>
                        <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${vehicle.isInProduction
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-gray-200 text-gray-600 border border-gray-300"
                                }`}
                        >
                            {vehicle.isInProduction ? "In Production" : "Discontinued"}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end mt-6 pt-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewVehicleModal;
