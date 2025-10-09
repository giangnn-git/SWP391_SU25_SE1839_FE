import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const partOptions = [
    { id: "BAT-001", name: "Battery Pack 48V" },
    { id: "INV-032", name: "Inverter Module" },
    { id: "BMS-004", name: "Battery Management System" },
    { id: "MOT-022", name: "Motor Drive Unit" },
];

const policyOptions = [
    { id: "WP-001", name: "Standard Warranty (2 years / 50,000km)" },
    { id: "WP-002", name: "Extended Warranty (3 years / 100,000km)" },
    { id: "WP-003", name: "High Voltage Components Only" },
];

const PartPolicyModal = ({ onClose, onSave, editData }) => {
    const [form, setForm] = useState({
        partId: "",
        policyId: "",
        startDate: "",
        endDate: "",
        status: "Active",
    });

    useEffect(() => {
        if (editData) setForm(editData);
    }, [editData]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.partId || !form.policyId || !form.startDate || !form.endDate) {
            alert("Please fill in all required fields.");
            return;
        }
        onSave(form);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[480px] p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                        {editData ? "Edit Part Policy" : "Add New Part Policy"}
                    </h2>
                    <button onClick={onClose}>
                        <X size={20} className="text-gray-600 hover:text-black" />
                    </button>
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Select Part */}
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Select Part</label>
                        <select
                            name="partId"
                            value={form.partId}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                            required
                        >
                            <option value="">-- Choose Part --</option>
                            {partOptions.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.id} — {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Select Policy */}
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Select Policy</label>
                        <select
                            name="policyId"
                            value={form.policyId}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                            required
                        >
                            <option value="">-- Choose Policy --</option>
                            {policyOptions.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.id} — {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Start Date</label>
                            <input
                                name="startDate"
                                type="date"
                                value={form.startDate}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">End Date</label>
                            <input
                                name="endDate"
                                type="date"
                                value={form.endDate}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2"
                        >
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                        </select>
                    </div>

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

export default PartPolicyModal;
