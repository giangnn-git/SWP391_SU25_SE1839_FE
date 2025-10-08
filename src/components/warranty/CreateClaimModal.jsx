import { useState } from "react";

const CreateClaimModal = ({ isOpen, onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        vin: "",
        mileage: "",
        priority: "NORMAL",
        description: "",
        partClaims: [{ id: "", quantity: "" }],
        attachments: [],
    });
    const [errors, setErrors] = useState({});


    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};

        // Validation phù hợp với state hiện tại
        if (!formData.vin.trim()) newErrors.vin = "VIN is required";
        if (!formData.mileage.trim()) newErrors.mileage = "Mileage is required";
        else if (isNaN(formData.mileage) || Number(formData.mileage) < 0)
            newErrors.mileage = "Mileage must be a positive number";

        if (!formData.priority.trim())
            newErrors.priority = "Priority is required";

        if (!formData.description.trim())
            newErrors.description = "Description is required";

        if (
            !formData.partClaims.length ||
            formData.partClaims.some(
                (p) => !p.id.trim() || !p.quantity || p.quantity <= 0
            )
        ) {
            newErrors.partClaims = "Each part must have valid ID and quantity";
        }

        // Không cần validate attachments nếu không bắt buộc
        // if (!formData.attachments.length)
        //     newErrors.attachments = "At least one attachment is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(formData);
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handlePartChange = (index, field, value) => {
        const updated = [...formData.partClaims];
        updated[index][field] = value;
        setFormData((prev) => ({ ...prev, partClaims: updated }));
    };

    const addPartClaim = () => {
        setFormData((prev) => ({
            ...prev,
            partClaims: [...prev.partClaims, { id: "", quantity: "" }],
        }));
    };


    const handleClose = () => {
        setFormData({
            vin: "",
            mileage: "",
            priority: "NORMAL",
            description: "",
            partClaims: [{ id: "", quantity: "" }],
            attachments: [],
        });
        setErrors({});
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Create New Claim</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* VIN Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            VIN *
                        </label>
                        <input
                            type="text"
                            value={formData.vin}
                            onChange={(e) => handleChange("vin", e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vin ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="Enter vehicle VIN"
                            disabled={loading}
                        />
                        {errors.vin && (
                            <p className="mt-1 text-sm text-red-600">{errors.vin}</p>
                        )}
                    </div>

                    {/* Mileage Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mileage *
                        </label>
                        <input
                            type="number"
                            value={formData.mileage}
                            onChange={(e) => handleChange("mileage", e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.mileage ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="Enter mileage"
                            disabled={loading}
                        />
                        {errors.mileage && (
                            <p className="mt-1 text-sm text-red-600">{errors.mileage}</p>
                        )}
                    </div>

                    {/* Priority Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority *
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => handleChange("priority", e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.priority ? "border-red-500" : "border-gray-300"
                                }`}
                            disabled={loading}
                        >
                            <option value="NORMAL">NORMAL</option>
                            <option value="HIGH">HIGH</option>
                            <option value="URGENT">URGENT</option>
                        </select>
                        {errors.priority && (
                            <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                        )}
                    </div>

                    {/* Description Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="Describe the issue"
                            disabled={loading}
                            rows={3}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    {/* Part Claims Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Part Claims *
                        </label>
                        {formData.partClaims.map((part, index) => (
                            <div key={index} className="flex space-x-2 mb-2">
                                <input
                                    type="text"
                                    value={part.id}
                                    onChange={(e) =>
                                        handlePartChange(index, "id", e.target.value)
                                    }
                                    placeholder="Part ID"
                                    className="flex-1 px-3 py-2 border rounded-lg"
                                    disabled={loading}
                                />
                                <input
                                    type="number"
                                    value={part.quantity}
                                    onChange={(e) =>
                                        handlePartChange(index, "quantity", e.target.value)
                                    }
                                    placeholder="Qty"
                                    className="w-24 px-3 py-2 border rounded-lg"
                                    disabled={loading}
                                />
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addPartClaim}
                            className="text-blue-600 text-sm hover:underline"
                        >
                            + Add another part
                        </button>
                        {errors.partClaims && (
                            <p className="mt-1 text-sm text-red-600">{errors.partClaims}</p>
                        )}
                    </div>

                    {/* Attachments Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Attachments
                        </label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) =>
                                handleChange("attachments", Array.from(e.target.files))
                            }
                            className="w-full"
                            disabled={loading}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Create Claim"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateClaimModal;
