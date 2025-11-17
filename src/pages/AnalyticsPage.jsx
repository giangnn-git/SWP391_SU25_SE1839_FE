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
import { getPerformanceReportApi } from "../services/api.service";

const AnalyticsPage = () => {
    const [activeTab, setActiveTab] = useState("performance");
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // --- KPI Cards static demo data ---
    const kpiCards = [
        {
            title: "Average Resolution Time",
            value: "3.2 days",
            change: "-8%",
            subtitle: "vs last month",
            icon: <Clock4 size={22} className="text-blue-600" />,
            color: "from-blue-50 to-blue-100",
        },
        {
            title: "Customer Satisfaction",
            value: "4.6 / 5.0",
            change: "+5%",
            subtitle: "vs last month",
            icon: <TrendingUp size={22} className="text-green-600" />,
            color: "from-green-50 to-green-100",
        },
        {
            title: "Warranty Cost / Vehicle",
            value: "$245",
            change: "-12%",
            subtitle: "vs last month",
            icon: <DollarSign size={22} className="text-orange-500" />,
            color: "from-orange-50 to-orange-100",
        },
        {
            title: "Repeat Claims Rate",
            value: "2.8%",
            change: "-15%",
            subtitle: "vs last month",
            icon: <AlertCircle size={22} className="text-red-500" />,
            color: "from-red-50 to-red-100",
        },
    ];

    // --- Fetch data from API ---
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
        if (activeTab === "performance") fetchPerformanceData();
    }, [activeTab]);

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 animate-fadeIn">
            {/* ====== HEADER ====== */}
            <div className="mb-8 text-center lg:text-left">
                <h1 className="text-3xl font-bold flex items-center justify-center lg:justify-start gap-2 tracking-tight text-gray-900">
                    <BarChart3 size={26} className="text-gray-900" />
                    Reporting & Analytics
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Comprehensive warranty analytics and predictive insights
                </p>
            </div>

            {/* ====== KPI CARDS ====== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {kpiCards.map((kpi, i) => (
                    <div
                        key={i}
                        className={`relative bg-white/80 border border-gray-200 shadow-md rounded-2xl p-5 
                        hover:shadow-xl transition-all duration-500 backdrop-blur-sm group overflow-hidden`}
                    >
                        {/* Background accent */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-40 group-hover:opacity-60 transition-all duration-500`}
                        ></div>

                        {/* Icon + Title */}
                        <div className="relative z-10 flex items-center gap-3 mb-3">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} shadow-inner`}>
                                {kpi.icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600">{kpi.title}</h3>
                                <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
                            </div>
                        </div>

                        {/* Change info */}
                        <div className="relative z-10 flex justify-between items-center text-xs text-gray-500">
                            <span
                                className={`font-semibold ${kpi.change.startsWith("+")
                                    ? "text-green-600"
                                    : "text-red-500"
                                    }`}
                            >
                                {kpi.change}
                            </span>
                            <span>{kpi.subtitle}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ====== CAPSULE TABS ====== */}
            <div className="flex justify-center lg:justify-start mb-6">
                <div className="relative bg-gray-100 border border-gray-200 rounded-full p-1 shadow-inner w-fit flex">
                    {/* Sliding indicator */}
                    <div
                        className={`absolute top-1 left-1 h-[85%] w-[48%] bg-white rounded-full shadow-sm transition-all duration-300 ease-in-out ${activeTab === "predictive"
                            ? "translate-x-[100%]"
                            : "translate-x-0"
                            }`}
                    ></div>

                    <button
                        onClick={() => setActiveTab("performance")}
                        className={`relative z-10 px-6 py-1.5 text-sm font-medium transition-all duration-300 ${activeTab === "performance"
                            ? "text-gray-900"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Performance
                    </button>
                    <button
                        onClick={() => setActiveTab("predictive")}
                        className={`relative z-10 px-6 py-1.5 text-sm font-medium transition-all duration-300 ${activeTab === "predictive"
                            ? "text-gray-900"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Predictive Analysis
                    </button>
                </div>
            </div>

            {/* ====== TAB CONTENT ====== */}
            <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl animate-fadeIn">
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
