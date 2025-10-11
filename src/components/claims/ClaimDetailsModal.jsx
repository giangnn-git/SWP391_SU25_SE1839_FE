import React from "react";
import { X } from "lucide-react";

const ClaimDetailsModal = ({ claim, onClose, onApprove, onReject }) => {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[550px] rounded-xl shadow-lg p-6 relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-black"
                >
                    <X size={20} />
                </button>
                <h2 className="text-lg font-semibold mb-4">
                    Claim Details — {claim.id}
                </h2>
                <div className="space-y-3 text-sm text-gray-700">
                    <p><b>Vehicle VIN:</b> {claim.vin}</p>
                    <p><b>Customer:</b> {claim.customer}</p>
                    <p><b>Service Center:</b> {claim.serviceCenter}</p>
                    <p><b>Part:</b> {claim.part}</p>
                    <p><b>Date:</b> {claim.date}</p>
                    <p><b>Description:</b> Overheating issue, battery replaced under warranty.</p>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onReject}
                        className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                    >
                        Reject
                    </button>
                    <button
                        onClick={onApprove}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                        Approve
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClaimDetailsModal;
