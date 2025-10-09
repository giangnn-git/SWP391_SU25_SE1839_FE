import React, { useState } from "react";
import { X, Building2 } from "lucide-react";

const centers = ["HCM Service Center", "Hanoi Service Center", "Danang Service Center"];

const DistributePartModal = ({ part, onClose }) => {
    const [center, setCenter] = useState("");
    const [amount, setAmount] = useState("");

    const handleConfirm = () => {
        if (!center || !amount) {
            alert("Please select a service center and enter a valid quantity.");
            return;
        }

        if (Number(amount) <= 0) {
            alert("Quantity must be greater than zero.");
            return;
        }

        if (Number(amount) > part.quantity) {
            alert(`Cannot distribute more than available stock (${part.quantity}).`);
            return;
        }

        alert(`✅ Successfully distributed ${amount} units of ${part.name} to ${center}.`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[400px] p-6 animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Distribute Part</h2>
                    <button onClick={onClose}>
                        <X size={20} className="text-gray-600 hover:text-black transition" />
                    </button>
                </div>

                {/* Info */}
                <p className="text-sm text-gray-600 mb-3">
                    Part: <b>{part.name}</b> ({part.code})<br />
                    <span className="text-gray-500">
                        Available stock: <b>{part.quantity}</b>
                    </span>
                </p>

                {/* Form */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                        <Building2 size={18} className="text-gray-600" />
                        <select
                            value={center}
                            onChange={(e) => setCenter(e.target.value)}
                            className="w-full outline-none text-gray-700 bg-transparent"
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                    <button
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                        onClick={handleConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DistributePartModal;
