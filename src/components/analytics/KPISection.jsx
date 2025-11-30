import React from "react";

const KPISection = () => {
    const kpiData = [
        { title: "Average Resolution Time", value: "3.2 days", trend: "-8% vs last month" },
        { title: "Customer Satisfaction", value: "4.6 / 5.0", trend: "+5% vs last month" },
        { title: "Warranty Cost / Vehicle", value: "$245", trend: "-12% vs last month" },
        { title: "Repeat Claims Rate", value: "2.8%", trend: "-15% vs last month" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {kpiData.map((kpi, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition"
                >
                    <h2 className="text-sm text-gray-600 mb-2">{kpi.title}</h2>
                    <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
                    <p
                        className={`text-xs mt-1 ${kpi.trend.startsWith("+") ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {kpi.trend}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default KPISection;
