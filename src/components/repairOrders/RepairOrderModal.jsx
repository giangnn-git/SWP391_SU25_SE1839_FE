import { useState, useEffect } from "react";

const RepairOrderModal = ({ order, onClose, onCreate, onUpdate }) => {
    const [formData, setFormData] = useState({
        orderId: null,
        claim: "",
        technician: "",
        parts: [""],
        status: "Pending",
    });

    useEffect(() => {
        if (order) setFormData({ ...order });
    }, [order]);

    const handlePartChange = (idx, value) => {
        const newParts = [...formData.parts];
        newParts[idx] = value;
        setFormData({ ...formData, parts: newParts });
    };

    const addPartField = () => setFormData({ ...formData, parts: [...formData.parts, ""] });

    const handleSubmit = () => {
        if (order) onUpdate(formData);
        else onCreate({ ...formData, orderId: Date.now() });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
                <h3 className="text-lg font-semibold mb-4">
                    {order ? "Edit Repair Order" : "Add Repair Order"}
                </h3>

                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Claim"
                        className="border p-2 rounded-md"
                        value={formData.claim}
                        onChange={(e) => setFormData({ ...formData, claim: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Technician"
                        className="border p-2 rounded-md"
                        value={formData.technician}
                        onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    />

                    <div>
                        <label className="text-sm font-medium">Parts</label>
                        {formData.parts.map((p, idx) => (
                            <input
                                key={idx}
                                type="text"
                                placeholder={`Part #${idx + 1}`}
                                className="border p-2 rounded-md mt-1 w-full"
                                value={p}
                                onChange={(e) => handlePartChange(idx, e.target.value)}
                            />
                        ))}
                        <button className="mt-2 px-3 py-1 bg-gray-300 rounded-md" onClick={addPartField}>
                            Add Part
                        </button>
                    </div>

                    <select
                        className="border p-2 rounded-md"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={handleSubmit}
                    >
                        {order ? "Update" : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RepairOrderModal;
