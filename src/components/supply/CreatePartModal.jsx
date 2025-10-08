import React, { useState } from "react";
import { X } from "lucide-react";

const CreatePartModal = ({ onClose }) => {
    const [form, setForm] = useState({
        code: "",
        name: "",
        model: "",
        quantity: "",
        location: "",
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[420px] p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Add New Part</h2>
                    <button onClick={onClose}>
                        <X size={20} className="text-gray-600 hover:text-black" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-3">
                    {["code", "name", "model", "quantity", "location"].map((field) => (
                        <input
                            key={field}
                            name={field}
                            type={field === "quantity" ? "number" : "text"}
                            placeholder={
                                field === "code"
                                    ? "Part Code"
                                    : field === "name"
                                        ? "Part Name"
                                        : field === "model"
                                            ? "Model"
                                            : field === "quantity"
                                                ? "Quantity"
                                                : "Storage Location"
                            }
                            value={form[field]}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
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
                    <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePartModal;
