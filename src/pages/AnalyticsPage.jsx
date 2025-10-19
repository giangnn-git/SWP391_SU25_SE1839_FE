import React, { useState, useEffect } from "react";
import {
    BarChart3,
    TrendingUp,
    Clock4,
    DollarSign,
    AlertCircle,
} from "lucide-react";
import PerformanceTab from "../components/analytics/PerformanceTab";
import PredictiveTab from "../components/analytics/PredictiveTab";
import { getPerformanceReportApi } from "../services/api.service"; // ✅ Thêm import

const AnalyticsPage = () => {
    const [activeTab, setActiveTab] = useState("performance");
    const [performanceData, setPerformanceData] = useState([]); // ✅ State chứa data từ API
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const kpiCards = [
        {
            title: "Average Resolution Time",
            value: "3.2 days",
            change: "-8%",
            subtitle: "vs last month",
            icon: <Clock4 size={22} className="text-blue-600" />,
        },
        {
            title: "Customer Satisfaction",
            value: "4.6 / 5.0",
            change: "+5%",
            subtitle: "vs last month",
            icon: <TrendingUp size={22} className="text-green-600" />,
        },
        {
            title: "Warranty Cost / Vehicle",
            value: "$245",
            change: "-12%",
            subtitle: "vs last month",
            icon: <DollarSign size={22} className="text-orange-500" />,
        },
        {
            title: "Repeat Claims Rate",
            value: "2.8%",
            change: "-15%",
            subtitle: "vs last month",
            icon: <AlertCircle size={22} className="text-red-500" />,
        },
    ];

    // ✅ Gọi API lấy dữ liệu Service Center Performance
    useEffect(() => {
        const fetchPerformanceData = async () => {
            try {
                setLoading(true);
                const res = await getPerformanceReportApi();
                setPerformanceData(res.data.data || []);
            } catch (err) {
                console.error("❌ Error fetching performance data:", err);
                setError("Failed to load performance data");
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === "performance") {
            fetchPerformanceData();
        }
    }, [activeTab]);

    return (
        <div className="p-6 animate-fadeIn">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BarChart3 size={22} className="text-blue-600" />
                    Reporting & Analytics
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Comprehensive warranty analytics and cost predictions
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {kpiCards.map((kpi, index) => (
                    <div
                        key={index}
                        className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gray-50 rounded-lg">{kpi.icon}</div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600">
                                    {kpi.title}
                                </h3>
                                <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span
                                className={
                                    kpi.change.startsWith("+")
                                        ? "text-green-600 font-semibold"
                                        : "text-red-600 font-semibold"
                                }
                            >
                                {kpi.change}
                            </span>
                            <span>{kpi.subtitle}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Capsule Tabs */}
            <div className="flex justify-start mb-6">
                <div className="inline-flex bg-gray-100 rounded-full p-1 shadow-inner">
                    <button
                        onClick={() => setActiveTab("performance")}
                        className={`px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${activeTab === "performance"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Performance
                    </button>
                    <button
                        onClick={() => setActiveTab("predictive")}
                        className={`px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${activeTab === "predictive"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Predictive Analysis
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                {activeTab === "performance" ? (
                    <PerformanceTab
                        data={performanceData}
                        loading={loading}
                        error={error}
                    />
                ) : (
                    <PredictiveTab />
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;
