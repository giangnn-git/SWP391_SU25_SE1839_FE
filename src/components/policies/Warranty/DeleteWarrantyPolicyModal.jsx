import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

const DeleteWarrantyPolicyModal = ({
    showModal,
    policy,
    actionLoading,
    onClose,
    onDeleted,
    deletePolicyApi,
}) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!policy?.id) {
            alert("Invalid policy ID.");
            return;
        }

        try {
            setLoading(true);

            // ✅ Gọi API xóa
            const response = await deletePolicyApi(policy.id);

            // ✅ Nếu BE trả 200 hoặc 204 => Xóa thành công
            if (response.status === 200 || response.status === 204) {
                alert(`🗑️ Deleted policy "${policy.name}" successfully!`);
                onDeleted();
                onClose();
            } else {
                alert(
                    response.data?.message ||
                    "⚠️ Failed to delete policy. Please check related part policies."
                );
            }
        } catch (error) {
            console.error("Delete failed:", error);

            // ✅ Nếu BE ném lỗi 500 (policy vẫn được liên kết với part policy)
            if (error.response?.status === 500) {
                alert(
                    error.response?.data?.message ||
                    "Cannot delete policy because it is still linked with active part policies."
                );
            } else {
                // ✅ Các lỗi khác (404, 401, timeout, network...)
                alert(
                    error.response?.data?.message ||
                    "Failed to delete policy. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[420px] p-6 text-center animate-fadeIn">
                {/* Icon cảnh báo */}
                <div className="flex justify-center mb-3">
                    <AlertTriangle className="text-red-500" size={40} />
                </div>

                {/* Tiêu đề */}
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Confirm Delete
                </h2>

                {/* Nội dung */}
                <p className="text-gray-600 mb-5">
                    Are you sure you want to delete the policy <br />
                    <b>"{policy?.name}"</b>?
                </p>

                {/* Buttons */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
                        disabled={loading || actionLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading || actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteWarrantyPolicyModal;
