import React from "react";

const ClaimApprovedModal = ({ claim, onClose, onApprove, onReject }) => {
    if (!claim) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg w-[520px] p-6 relative">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Claim Details
                </h2>

                <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Claim ID:</strong> {claim.id}</p>
                    <p><strong>VIN:</strong> {claim.vin}</p>
                    <p><strong>Vehicle:</strong> {claim.vehicle}</p>
                    <p><strong>Customer:</strong> {claim.customer}</p>
                    <p><strong>Service Center:</strong> {claim.serviceCenter}</p>
                    <p><strong>Description:</strong> {claim.description}</p>
                    <p><strong>Priority:</strong> {claim.priority}</p>
                    <p><strong>Warranty:</strong> {claim.warrantyStatus} (valid until {claim.validUntil})</p>
                    <p><strong>Status:</strong> {claim.status}</p>
                    <p><strong>Estimated Cost:</strong> {claim.cost}</p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                        Close
                    </button>

                    {claim.status === "Pending" && (
                        <>
                            <button
                                onClick={() => {
                                    onApprove(claim);
                                    onClose();
                                }}
                                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => {
                                    onReject(claim);
                                    onClose();
                                }}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                            >
                                Reject
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClaimApprovedModal;
