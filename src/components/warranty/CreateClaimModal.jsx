import { useState } from "react";
import axios from "../../services/axios.customize";

const CreateClaimModal = ({ onClose, onClaimCreated }) => {
    const [formData, setFormData] = useState({
        description: "",
        mileage: "",
        vin: "",
        priority: "NORMAL",
        partClaims: [{ id: "", quantity: "" }],
        attachments: [],
    });
    const [actionLoading, setActionLoading] = useState(false);

    //  Gửi claim
    const handleCreateClaim = async () => {
        try {
            setActionLoading(true);
            const fd = new FormData();

            const claimObj = {
                description: formData.description,
                mileage: parseInt(formData.mileage),
                vin: formData.vin,
                priority: formData.priority,
                partClaims: formData.partClaims
                    .filter((p) => p.id && p.quantity)
                    .map((p) => ({
                        id: parseInt(p.id),
                        quantity: parseInt(p.quantity),
                    })),
            };

            fd.append(
                "claim",
                new Blob([JSON.stringify(claimObj)], { type: "application/json" })
            );
            formData.attachments.forEach((file) => fd.append("attachments", file));

            const res = await axios.post("/api/api/claims", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("✅ Claim created successfully!");
            onClaimCreated(res.data.data);
            onClose();
        } catch (err) {
            console.error(err);
            alert("❌ Failed to create claim!");
        } finally {
            setActionLoading(false);
        }
    };

    //  Upload và preview ảnh
    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const updatedFiles = [...formData.attachments, ...newFiles];
        setFormData({ ...formData, attachments: updatedFiles });
    };

    //  Xoá ảnh
    const handleRemoveImage = (index) => {
        const updated = formData.attachments.filter((_, i) => i !== index);
        setFormData({ ...formData, attachments: updated });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-[500px] max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    🧾 Create New Claim
                </h3>

                <div className="flex flex-col gap-4">
                    {/* Description */}
                    <input
                        type="text"
                        placeholder="Description"
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                    />

                    {/* Mileage */}
                    <input
                        type="number"
                        placeholder="Mileage"
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={formData.mileage}
                        onChange={(e) =>
                            setFormData({ ...formData, mileage: e.target.value })
                        }
                    />

                    {/* VIN */}
                    <input
                        type="text"
                        placeholder="VIN"
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={formData.vin}
                        onChange={(e) =>
                            setFormData({ ...formData, vin: e.target.value })
                        }
                    />

                    {/* Priority */}
                    <select
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={formData.priority}
                        onChange={(e) =>
                            setFormData({ ...formData, priority: e.target.value })
                        }
                    >
                        <option value="NORMAL">NORMAL</option>
                        <option value="HIGH">HIGH</option>
                    </select>

                    {/* Part Claims */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Part Claims
                        </label>
                        {formData.partClaims.map((p, idx) => (
                            <div key={idx} className="flex gap-2 mt-2">
                                <input
                                    type="number"
                                    placeholder="Part ID"
                                    className="border p-2 rounded-md w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={p.id}
                                    onChange={(e) => {
                                        const newParts = [...formData.partClaims];
                                        newParts[idx].id = e.target.value;
                                        setFormData({
                                            ...formData,
                                            partClaims: newParts,
                                        });
                                    }}
                                />
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    className="border p-2 rounded-md w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={p.quantity}
                                    onChange={(e) => {
                                        const newParts = [...formData.partClaims];
                                        newParts[idx].quantity = e.target.value;
                                        setFormData({
                                            ...formData,
                                            partClaims: newParts,
                                        });
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="text-sm font-medium mb-1 block text-gray-700">
                            Attachments
                        </label>
                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-md border border-blue-300 hover:bg-blue-100 transition"
                            >
                                Choose Files
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {formData.attachments.length > 0 && (
                                <span className="text-gray-600 text-sm">
                                    {formData.attachments.length} file(s) selected
                                </span>
                            )}
                        </div>

                        {/* Image Preview */}
                        {formData.attachments.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mt-3">
                                {formData.attachments.map((file, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-24 object-cover rounded-md border shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-xs px-2 opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                        onClick={handleCreateClaim}
                        disabled={actionLoading}
                    >
                        {actionLoading ? "Processing..." : "Create Claim"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateClaimModal;
