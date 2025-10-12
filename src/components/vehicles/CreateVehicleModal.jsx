import React, { useState } from "react";
import { X, CarFront } from "lucide-react";

const CreateVehicleModal = ({ onClose, onSubmit }) => {
    const [form, setForm] = useState({
        name: "",
        releaseYear: "",
        description: "",
        isInProduction: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = () => {
        if (!form.name || !form.releaseYear) {
            alert("Please fill in all required fields before saving.");
            return;
        }
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-[2px]">
            <div className="bg-white rounded-2xl shadow-2xl w-[460px] p-6 animate-fadeIn border border-gray-100 relative">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                        <CarFront size={20} className="text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Add New Vehicle</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition"
                    >
                        <X size={18} className="text-gray-600 hover:text-black" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    {/* Model Name */}
                    <div>
                        <label className="block text-sm text-gray-700 mb-1 font-medium">
                            Model Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="name"
                            type="text"
                            placeholder="Enter model name..."
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>

                    {/* Release Year */}
                    <div>
                        <label className="block text-sm text-gray-700 mb-1 font-medium">
                            Release Year <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="releaseYear"
                            type="number"
                            placeholder="e.g. 2024"
                            value={form.releaseYear}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-gray-700 mb-1 font-medium">
                            Description
                        </label>
                        <textarea
                            name="description"
                            placeholder="Enter short vehicle description..."
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                        ></textarea>
                    </div>

                    {/* Production Status */}
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            name="isInProduction"
                            type="checkbox"
                            checked={form.isInProduction}
                            onChange={handleChange}
                            className="accent-blue-600 w-4 h-4"
                        />
                        <span>Currently in production</span>
                    </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                    >
                        Save Vehicle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateVehicleModal;
