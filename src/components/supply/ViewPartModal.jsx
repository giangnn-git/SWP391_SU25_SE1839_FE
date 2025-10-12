import React from "react";
import { X, Eye } from "lucide-react";

const ViewPartModal = ({ part, onClose }) => {
    if (!part) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg w-[460px] p-6 animate-fadeIn relative">
                {/* Header */}
                <div className="flex items-center gap-2 mb-5 border-b pb-3">
                    <Eye size={22} className="text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                        Part Details
                    </h2>
                </div>

                {/* Body */}
                <div className="space-y-3 text-sm text-gray-700">
                    <div>
                        <p className="font-semibold text-gray-900">Part Code:</p>
                        <p className="text-gray-700">{part.code}</p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-900">Name:</p>
                        <p className="text-gray-700">{part.name}</p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-900">Model:</p>
                        <p className="text-gray-700">{part.model}</p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-900">Quantity:</p>
                        <p className="text-gray-700">{part.quantity}</p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-900">Warehouse:</p>
                        <p className="text-gray-700">{part.location}</p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-900">Status:</p>
                        <p
                            className={`${part.status === "Critical"
                                ? "text-red-600 font-medium"
                                : part.status === "Low stock"
                                    ? "text-orange-500 font-medium"
                                    : "text-green-600 font-medium"
                                }`}
                        >
                            {part.status}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition font-medium"
                    >
                        Close
                    </button>
                </div>

                {/* Corner close icon */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default ViewPartModal;
