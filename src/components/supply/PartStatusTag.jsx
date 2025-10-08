import React from "react";
import { AlertTriangle } from "lucide-react";

const PartStatusTag = ({ status }) => {
    const base = "inline-flex items-center px-2 py-1 text-xs rounded-md font-medium";

    if (status === "Available")
        return <span className={`${base} bg-green-100 text-green-700`}>In Stock</span>;
    if (status === "Low stock")
        return (
            <span className={`${base} bg-yellow-100 text-yellow-700`}>
                <AlertTriangle size={12} className="mr-1" /> Low Stock
            </span>
        );
    if (status === "Critical")
        return (
            <span className={`${base} bg-red-100 text-red-700`}>
                <AlertTriangle size={12} className="mr-1" /> Out of Stock
            </span>
        );

    return <span className={`${base} bg-gray-100 text-gray-600`}>Unknown</span>;
};

export default PartStatusTag;
