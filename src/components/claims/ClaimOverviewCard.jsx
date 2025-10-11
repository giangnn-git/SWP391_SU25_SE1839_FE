import React from "react";

const ClaimOverviewCard = ({ title, value, sub, color }) => {
    const colorMap = {
        yellow: "from-yellow-50 to-yellow-100 text-yellow-700",
        red: "from-red-50 to-red-100 text-red-700",
        blue: "from-blue-50 to-blue-100 text-blue-700",
        green: "from-green-50 to-green-100 text-green-700",
    };

    return (
        <div
            className={`bg-gradient-to-br ${colorMap[color]} rounded-xl p-5 shadow-sm border border-gray-100`}
        >
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-gray-600 mt-1">{sub}</p>
        </div>
    );
};

export default ClaimOverviewCard;
