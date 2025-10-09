import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const CreatePartModal = ({ onClose, onSubmit, editMode = false, part = null }) => {
    const [form, setForm] = useState({
        code: "",
        name: "",
        model: "",
        quantity: "",
        location: "",
    });

    // Khi ở chế độ Edit → load dữ liệu sẵn
    useEffect(() => {
        if (editMode && part) {
            setForm({
                code: part.code || "",
                name: part.name || "",
                model: part.model || "",
                quantity: part.quantity || "",
                location: part.location || "",
            });
        }
    }, [editMode, part]);

    // Xử lý thay đổi input
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // Gửi dữ liệu form về SupplyChain.jsx
    const handleSubmit = () => {
        if (!form.code || !form.name || !form.model || !form.quantity || !form.location) {
            alert("Please fill in all fields before saving.");
            return;
        }

        const formattedPart = {
            ...form,
            quantity: Number(form.quantity),
            id: editMode && part ? part.id : Date.now(),
            status: form.quantity <= 3 ? "Critical" : form.quantity <= 6 ? "Low stock" : "Available",
        };

        onSubmit(formattedPart);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[420px] p-6 animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                        {editMode ? "Edit Part Information" : "Add New Part"}
                    </h2>
                    <button onClick={onClose}>
                        <X size={20} className="text-gray-600 hover:text-black transition" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-3">
                    {["code", "name", "model", "quantity", "location"].map((field) => (
                        <div key={field}>
                            <label className="block text-sm text-gray-700 mb-1 capitalize">
                                {field === "code"
                                    ? "Part Code"
                                    : field === "name"
                                        ? "Part Name"
                                        : field === "model"
                                            ? "Model"
                                            : field === "quantity"
                                                ? "Quantity"
                                                : "Storage Location"}
                            </label>
                            <input
                                name={field}
                                type={field === "quantity" ? "number" : "text"}
                                placeholder={
                                    field === "code"
                                        ? "Enter part code..."
                                        : field === "name"
                                            ? "Enter part name..."
                                            : field === "model"
                                                ? "Enter model..."
                                                : field === "quantity"
                                                    ? "Enter quantity..."
                                                    : "Enter warehouse location..."
                                }
                                value={form[field]}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-5">
                    <button
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md text-white transition ${editMode
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-black hover:bg-gray-800"
                            }`}
                        onClick={handleSubmit}
                    >
                        {editMode ? "Save Changes" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePartModal;
