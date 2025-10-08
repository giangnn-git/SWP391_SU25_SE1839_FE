import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const CreatePolicyModal = ({ onClose, onSave, editData }) => {
    const [form, setForm] = useState({
        partName: "",
        model: "",
        duration: "",
        conditions: "",
        status: "Active",
    });

    // ✅ Nếu đang edit thì load dữ liệu vào form
    useEffect(() => {
        if (editData) {
            setForm(editData);
        }
    }, [editData]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.partName || !form.model || !form.duration) {
            alert("Please fill in all required fields.");
            return;
        }
        onSave(form);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[450px] p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                        {editData ? "Edit Warranty Policy" : "Add New Warranty Policy"}
                    </h2>
                    <button onClick={onClose}>
                        <X size={20} className="text-gray-600 hover:text-black" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        name="partName"
                        type="text"
                        placeholder="Part Name"
                        value={form.partName}
                        onChange={handleChange}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                    <input
                        name="model"
                        type="text"
                        placeholder="Model"
                        value={form.model}
                        onChange={handleChange}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                    <input
                        name="duration"
                        type="number"
                        placeholder="Warranty Duration (months)"
                        value={form.duration}
                        onChange={handleChange}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                    <textarea
                        name="conditions"
                        placeholder="Warranty Conditions"
                        value={form.conditions}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    >
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                    </select>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-5">
                        <button
                            type="button"
                            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                        >
                            {editData ? "Save Changes" : "Save Policy"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePolicyModal;
