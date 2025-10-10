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

            fd.append("claim", new Blob([JSON.stringify(claimObj)], { type: "application/json" }));
            formData.attachments.forEach((file) => fd.append("attachments", file));

            const res = await axios.post("/api/api/claims", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("✅ Claim tạo thành công!");
            onClaimCreated(res.data.data); // thêm vào đầu
            onClose();
        } catch (err) {
            console.error(err);
            alert("❌ Tạo claim thất bại!");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
                <h3 className="text-lg font-semibold mb-4">Thêm Claim mới</h3>
                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Description"
                        className="border p-2 rounded-md"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Mileage"
                        className="border p-2 rounded-md"
                        value={formData.mileage}
                        onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="VIN"
                        className="border p-2 rounded-md"
                        value={formData.vin}
                        onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    />
                    <select
                        className="border p-2 rounded-md"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                        <option value="NORMAL">NORMAL</option>
                        <option value="HIGH">HIGH</option>
                    </select>

                    {/* Part Claims */}
                    <div>
                        <label className="text-sm font-medium">Part Claims</label>
                        {formData.partClaims.map((p, idx) => (
                            <div key={idx} className="flex gap-2 mt-1">
                                <input
                                    type="number"
                                    placeholder="Part ID"
                                    className="border p-2 rounded-md w-1/2"
                                    value={p.id}
                                    onChange={(e) => {
                                        const newParts = [...formData.partClaims];
                                        newParts[idx].id = e.target.value;
                                        setFormData({ ...formData, partClaims: newParts });
                                    }}
                                />
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    className="border p-2 rounded-md w-1/2"
                                    value={p.quantity}
                                    onChange={(e) => {
                                        const newParts = [...formData.partClaims];
                                        newParts[idx].quantity = e.target.value;
                                        setFormData({ ...formData, partClaims: newParts });
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Attachments */}
                    <div>
                        <label className="text-sm font-medium">Attachments</label>
                        <input
                            type="file"
                            multiple
                            className="mt-1"
                            onChange={(e) => setFormData({ ...formData, attachments: Array.from(e.target.files) })}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={onClose}>
                        Hủy
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={handleCreateClaim}
                        disabled={actionLoading}
                    >
                        {actionLoading ? "Đang xử lý..." : "Tạo Claim"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateClaimModal;
