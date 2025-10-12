import React from "react";
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    HelpCircle,
} from "lucide-react";

const PartStatusTag = ({ status }) => {
    const base =
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium tracking-wide border transition-all duration-200";

    // ✅ Available
    if (status === "Available")
        return (
            <span
                className={`${base} bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:scale-[1.03]`}
                title="This part is in sufficient stock."
            >
                <CheckCircle2 size={12} className="text-green-600" />
                In Stock
            </span>
        );

    // ✅ Low Stock
    if (status === "Low stock")
        return (
            <span
                className={`${base} bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:scale-[1.03]`}
                title="Stock is running low. Consider restocking soon."
            >
                <AlertTriangle size={12} className="text-yellow-700" />
                Low Stock
            </span>
        );

    // ✅ Critical (with pulse animation)
    if (status === "Critical")
        return (
            <span
                className={`${base} bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:scale-[1.03] relative overflow-hidden`}
                title="Critical shortage. Immediate action required."
            >
                {/* 🔴 Pulse effect behind icon */}
                <span className="absolute inset-0 rounded-md bg-red-100 animate-pulse-slow opacity-60"></span>
                <XCircle size={12} className="text-red-700 relative z-10" />
                <span className="relative z-10">Out of Stock</span>
            </span>
        );

    // ✅ Unknown / default fallback
    return (
        <span
            className={`${base} bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100`}
            title="Unknown stock status."
        >
            <HelpCircle size={12} className="text-gray-500" />
            Unknown
        </span>
    );
};

export default PartStatusTag;
