import React from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

const PartStatusTag = ({ status }) => {
    const base =
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium tracking-wide transition";

    if (status === "Available")
        return (
            <span
                className={`${base} bg-green-100 text-green-700 border border-green-200`}
            >
                <CheckCircle2 size={12} className="text-green-600" />
                In Stock
            </span>
        );

    if (status === "Low stock")
        return (
            <span
                className={`${base} bg-yellow-100 text-yellow-800 border border-yellow-200`}
            >
                <AlertTriangle size={12} className="text-yellow-700" />
                Low Stock
            </span>
        );

    if (status === "Critical")
        return (
            <span
                className={`${base} bg-red-100 text-red-700 border border-red-200`}
            >
                <XCircle size={12} className="text-red-700" />
                Out of Stock
            </span>
        );

    return (
        <span
            className={`${base} bg-gray-100 text-gray-600 border border-gray-200`}
        >
            Unknown
        </span>
    );
};

export default PartStatusTag;
