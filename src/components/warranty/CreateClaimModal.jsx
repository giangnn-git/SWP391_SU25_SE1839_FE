import { useState, useEffect } from "react";
import { X, Plus, Image as ImageIcon, AlertCircle, Loader } from "lucide-react";
import axios from "../../services/axios.customize";
import toast from "react-hot-toast";

const CreateClaimModal = ({ onClose, onClaimCreated }) => {
    const [formData, setFormData] = useState({
        description: "",
        mileage: "",
        vin: "",
        priority: "NORMAL",
        partClaims: [{ category: "", partId: "", quantity: "" }],
        attachments: [],
    });
    const [actionLoading, setActionLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [partsByCategory, setPartsByCategory] = useState({}); // cache parts list

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("/api/api/categories");
                setCategories(res.data.data.category || []);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchCategories();
    }, []);

    const fetchParts = async (category) => {
        if (!category || partsByCategory[category]) return; // already fetched
        try {
            const res = await axios.get(`/api/api/parts/${category}`);
            setPartsByCategory((prev) => ({ ...prev, [category]: res.data.data.partList || [] }));
        } catch (err) {
            console.error("Failed to fetch parts:", err);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.mileage) newErrors.mileage = "Mileage is required";
        if (!formData.vin.trim()) newErrors.vin = "VIN is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //  Gửi claim
    const handleCreateClaim = async () => {
        if (!validateForm()) return;

        try {
            setActionLoading(true);
            const fd = new FormData();

            const claimObj = {
                description: formData.description,
                mileage: parseInt(formData.mileage),
                vin: formData.vin,
                priority: formData.priority,
                partClaims: formData.partClaims
                    .filter((p) => p.partId && p.quantity)
                    .map((p) => ({
                        id: parseInt(p.partId),
                        quantity: parseInt(p.quantity),
                    })),
            };

            fd.append("claim", new Blob([JSON.stringify(claimObj)], { type: "application/json" }));
            formData.attachments.forEach((file) => fd.append("attachments", file));

            const res = await axios.post("/api/api/claims", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Claim created successfully!");


            onClaimCreated(res.data.data);
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create claim. Please try again.");
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

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const handlePartChange = (idx, field, value) => {
        const newParts = [...formData.partClaims];
        newParts[idx][field] = value;

        if (field === "category") {
            newParts[idx].partId = ""; // reset selected part
            fetchParts(value);
        }

        setFormData({ ...formData, partClaims: newParts });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Create New Claim</h2>
                        <p className="text-sm text-gray-600 mt-1">Fill in the details below</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-gray-700" title="Close">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            placeholder="Enter claim description..."
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.description ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                            rows="3"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                        />
                        {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
                    </div>

                    {/* Grid: Mileage & VIN */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Mileage (km) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                placeholder="Enter mileage..."
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.mileage ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                                value={formData.mileage}
                                onChange={(e) => handleInputChange("mileage", e.target.value)}
                            />
                            {errors.mileage && <p className="text-red-600 text-xs mt-1">{errors.mileage}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                VIN <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter VIN..."
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.vin ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                                value={formData.vin}
                                onChange={(e) => handleInputChange("vin", e.target.value)}
                            />
                            {errors.vin && <p className="text-red-600 text-xs mt-1">{errors.vin}</p>}
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Priority</label>
                        <select
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={formData.priority}
                            onChange={(e) => handleInputChange("priority", e.target.value)}
                        >
                            <option value="NORMAL">Normal</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>

                    {/* Part Claims */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Requested Parts</label>
                        <div className="space-y-2">
                            {formData.partClaims.map((part, idx) => {
                                const partsList = partsByCategory[part.category] || [];
                                const selectedPart = partsList.find((p) => p.id === parseInt(part.partId));
                                return (
                                    <div key={idx} className="flex gap-2 items-end">
                                        {/* Category select */}
                                        <div className="flex-1">
                                            <select
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                value={part.category}
                                                onChange={(e) => handlePartChange(idx, "category", e.target.value)}
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map((c, i) => (
                                                    <option key={i} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Part select */}
                                        <div className="flex-1">
                                            <select
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                value={part.partId}
                                                onChange={(e) => handlePartChange(idx, "partId", e.target.value)}
                                                disabled={!part.category}
                                            >
                                                <option value="">Select Part</option>
                                                {partsList.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Quantity */}
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Quantity"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                value={part.quantity}
                                                onChange={(e) => handlePartChange(idx, "quantity", e.target.value)}
                                            />
                                        </div>

                                        {/* Show selected part name
                                        <div className="flex-1 text-gray-700 font-medium">
                                            {selectedPart ? selectedPart.name : "-"}
                                        </div> */}

                                        {formData.partClaims.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newParts = formData.partClaims.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, partClaims: newParts });
                                                }}
                                                className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Remove"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setFormData({
                                    ...formData,
                                    partClaims: [...formData.partClaims, { category: "", partId: "", quantity: "" }],
                                })
                            }
                            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition"
                        >
                            <Plus size={18} />
                            Add Part
                        </button>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Attachments</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition">
                            <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                            <div className="flex flex-col items-center gap-2">
                                <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold">
                                    Choose Files
                                </label>
                                <p className="text-gray-500 text-sm">or drag and drop images here</p>
                            </div>
                            <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>

                        {formData.attachments.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mt-4 mb-3">{formData.attachments.length} file(s) selected</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {formData.attachments.map((file, index) => (
                                        <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-24 object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition"
                                                title="Remove image"
                                            >
                                                <div className="bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                                                    <X size={16} />
                                                </div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button className="px-6 py-2.5 border border-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition" onClick={onClose} disabled={actionLoading}>
                        Cancel
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition" onClick={handleCreateClaim} disabled={actionLoading}>
                        {actionLoading ? (<><Loader size={18} className="animate-spin" />Processing...</>) : "Create Claim"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateClaimModal;
