import React from "react";
import { X, Eye } from "lucide-react";

const ViewPartModal = ({ part, onClose }) => {
    if (!part) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white/95 border border-gray-200 shadow-2xl rounded-3xl w-[480px] p-7 relative transition-all duration-300 hover:shadow-blue-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Eye size={20} className="text-blue-700" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                            Part Details
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-semibold tracking-wide">
                            Part Code
                        </p>
                        <p className="text-gray-900 font-medium">{part.code || "N/A"}</p>
                    </div>

                    <div>
                        <p className="text-gray-500 text-xs uppercase font-semibold tracking-wide">
                            Name
                        </p>
                        <p className="text-gray-900 font-medium">{part.name || "N/A"}</p>
                    </div>

                    <div>
                        <p className="text-gray-500 text-xs uppercase font-semibold tracking-wide">
                            Category
                        </p>
                        <p className="text-gray-900 font-medium">{part.category || "-"}</p>
                    </div>

                    <div>
                        <p className="text-gray-500 text-xs uppercase font-semibold tracking-wide">
                            Quantity
                        </p>
                        <p className="text-blue-700 font-semibold">{part.quantity ?? 0}</p>
                    </div>

                    <div className="col-span-2">
                        <p className="text-gray-500 text-xs uppercase font-semibold tracking-wide">
                            Warehouse
                        </p>
                        <p className="text-gray-900 font-medium">
                            {part.warehouse || "Unknown Warehouse"}
                        </p>
                    </div>

                    <div className="col-span-2">
                        <p className="text-gray-500 text-xs uppercase font-semibold tracking-wide">
                            Address
                        </p>
                        <p className="text-gray-900 font-medium leading-snug">
                            {part.address || "Unknown Address"}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewPartModal;
