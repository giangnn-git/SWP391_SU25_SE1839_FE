import React from "react";
import { AlertTriangle } from "lucide-react";

const PolicyStatusTag = ({ status }) => {
    const base = "inline-flex items-center px-2 py-1 text-xs rounded-md font-medium";

    if (status === "Active")
        return <span className={`${base} bg-green-100 text-green-700`}>Active</span>;
    if (status === "Expired")
        return (
            <span className={`${base} bg-red-100 text-red-700`}>
                <AlertTriangle size={12} className="mr-1" /> Expired
            </span>
        );

    return <span className={`${base} bg-gray-100 text-gray-600`}>Unknown</span>;
};

export default PolicyStatusTag;
