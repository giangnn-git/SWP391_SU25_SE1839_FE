import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PredictiveTab = () => {
    // Dữ liệu mẫu mô phỏng chi phí dự báo
    const costData = [
        { month: "Jan", current: 135000, forecast: 140000 },
        { month: "Feb", current: 142000, forecast: 147000 },
        { month: "Mar", current: 138000, forecast: 144000 },
        { month: "Apr", current: 145000, forecast: 150000 },
        { month: "May", current: 149000, forecast: 156000 },
        { month: "Jun", current: 152000, forecast: 158000 },
        { month: "Jul", current: 155000, forecast: 160000 },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800">Predictive Cost Analysis</h2>
                <p className="text-sm text-gray-500">
                    Forecast warranty costs based on historical data and trends
                </p>
            </div>

            {/* Chart Container */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={costData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
                        <YAxis
                            tickFormatter={(v) => `$${v / 1000}k`}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                        />
                        <Tooltip
                            formatter={(value) => [`$${value.toLocaleString()}`, "Cost"]}
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                fontSize: "12px",
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="current"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Current Cost"
                        />
                        <Line
                            type="monotone"
                            dataKey="forecast"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Forecast"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PredictiveTab;
