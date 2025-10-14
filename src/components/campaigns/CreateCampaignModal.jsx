import React from "react";

const CampaignOverviewCard = ({ title, value, sub, color, icon }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    red: "bg-red-50 border-red-200 text-red-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };

  const iconClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    orange: "text-orange-600 bg-orange-100",
    red: "text-red-600 bg-red-100",
    gray: "text-gray-600 bg-gray-100",
    purple: "text-purple-600 bg-purple-100",
  };

  return (
    <div
      className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all duration-300 hover:shadow-md hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-xs opacity-70 mt-1">{sub}</p>
        </div>
        <div className={`p-3 rounded-full ${iconClasses[color]}`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
      </div>

      {/* Progress bar indicator for active/upcoming campaigns */}
      {(title === "Active" || title === "Upcoming") && (
        <div className="mt-4">
          <div className="w-full bg-white rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                color === "green"
                  ? "bg-green-500"
                  : color === "orange"
                  ? "bg-orange-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${(parseInt(value) / 10) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignOverviewCard;
