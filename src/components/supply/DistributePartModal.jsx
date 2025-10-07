import React, { useState } from "react";
import { X, Building2 } from "lucide-react";

const centers = ["HCM Service Center", "Hanoi Service Center", "Danang Service Center"];

const DistributePartModal = ({ part, onClose }) => {
    const [center, setCenter] = useState("");
    const [amount, setAmount] = useState("");

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[400px] p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Distribute Part</h2>
                    <button onClick={onClose}>
                        <X size={20} className="text-gray-600 hover:text-black" />
                    </button>
                </div>

                {/* Info */}
                <p className="text-sm text-gray-600 mb-3">
                    Part: <b>{part.name}</b> ({part.code})
                </p>

                {/* Form */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 border rounded-md px-3 py-2">
                        <Building2 size={18} className="text-gray-600" />
                        <select
                            value={center}
                            onChange={(e) => setCenter(e.target.value)}
                            className="w-full outline-none text-gray-700"
                        >
                            <option value="">Select Service Center</option>
                            {centers.map((c, i) => (
                                <option key={i} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <input
                        type="number"
                        placeholder="Distribution Quantity"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
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
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DistributePartModal;
