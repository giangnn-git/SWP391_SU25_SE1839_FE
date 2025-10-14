import React, { useState, useEffect } from "react";
import { X, Building2, AlertCircle, CheckCircle2 } from "lucide-react";

const centers = ["HCM Service Center", "Hanoi Service Center", "Danang Service Center"];

const DistributePartModal = ({ part, onClose }) => {
    const [center, setCenter] = useState("");
    const [amount, setAmount] = useState("");
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [fadeOut, setFadeOut] = useState(false);

    //  Tự động ẩn thông báo sau 2.5s
    useEffect(() => {
        if (feedback.message) {
            const timer = setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setFeedback({ type: "", message: "" });
                    setFadeOut(false);
                }, 400);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    const handleConfirm = () => {
        //  Kiểm tra nhập liệu
        if (!center || !amount) {
            setFeedback({ type: "error", message: "Please select a service center and enter quantity." });
            return;
        }

        if (Number(amount) <= 0) {
            setFeedback({ type: "error", message: "Quantity must be greater than zero." });
            return;
        }

        if (Number(amount) > part.quantity) {
            setFeedback({
                type: "error",
                message: `Cannot distribute more than available stock (${part.quantity}).`,
            });
            return;
        }

        //  Hiển thị thông báo thành công
        setFeedback({
            type: "success",
            message: `✅ Successfully distributed ${amount} units of ${part.name} to ${center}.`,
        });

        //  Reset form sau khi thành công
        setCenter("");
        setAmount("");

        //  Tự đóng modal sau một chút delay (mượt hơn UX)
        setTimeout(() => {
            onClose();
        }, 1800);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div
                className={`bg-white rounded-xl shadow-lg w-[400px] p-6 transform transition-all duration-300 ${fadeOut ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                    }`}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Distribute Part</h2>
                    <button onClick={onClose}>
                        <X size={20} className="text-gray-600 hover:text-black transition" />
                    </button>
                </div>

                {/* Thông báo feedback */}
                {feedback.message && (
                    <div
                        className={`flex items-center gap-2 text-sm mb-3 px-3 py-2 rounded-md transition-opacity duration-500 ${feedback.type === "error"
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-green-50 text-green-700 border border-green-200"
                            } ${fadeOut ? "opacity-0" : "opacity-100"}`}
                    >
                        {feedback.type === "error" ? (
                            <AlertCircle size={16} />
                        ) : (
                            <CheckCircle2 size={16} />
                        )}
                        {feedback.message}
                    </div>
                )}

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
