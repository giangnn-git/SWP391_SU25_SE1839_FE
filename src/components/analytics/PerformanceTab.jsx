import React, { useEffect, useState } from "react";
import {
    getPerformanceReportApi,
    getCompletedDurationReportApi,
} from "../../services/api.service";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LabelList,
} from "recharts";

const PerformanceTab = () => {
    const [performanceData, setPerformanceData] = useState([]);
    const [durationData, setDurationData] = useState([]);

    const [loadingPerformance, setLoadingPerformance] = useState(false);
    const [loadingDuration, setLoadingDuration] = useState(false);

    const [errorPerformance, setErrorPerformance] = useState("");
    const [errorDuration, setErrorDuration] = useState("");

    //  Fetch Service Center Performance
    useEffect(() => {
        const fetchPerformanceReport = async () => {
            try {
                setLoadingPerformance(true);
                const res = await getPerformanceReportApi();
                setPerformanceData(res.data.data || []);
            } catch (err) {
                console.error("❌ Error fetching performance report:", err);
                setErrorPerformance("Failed to load service center performance");
            } finally {
                setLoadingPerformance(false);
            }
        };

        fetchPerformanceReport();
    }, []);

    //  Fetch Resolution Time Distribution
    useEffect(() => {
        const fetchDurationReport = async () => {
            try {
                setLoadingDuration(true);
                const res = await getCompletedDurationReportApi();
                const rawData = res.data.data || {};

                //  Map backend keys → readable labels
                const labels = {
                    under24h: "< 1 day",
                    under72h: "1–3 days",
                    under168h: "3–7 days",
                    over168h: "> 7 days",
                };

                //  Convert object → array + compute %
                const total = Object.values(rawData).reduce((sum, val) => sum + val, 0);
                const formatted = Object.entries(rawData).map(([key, value]) => ({
                    rangeLabel: labels[key] || key,
                    totalClaims: value,
                    percent: total > 0 ? Math.round((value / total) * 100) : 0,
                }));

                setDurationData(formatted);
            } catch (err) {
                console.error("❌ Error fetching duration report:", err);
                setErrorDuration("Failed to load resolution time data");
            } finally {
                setLoadingDuration(false);
            }
        };

        fetchDurationReport();
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
            {/*  Left - Service Center Performance */}
            {/*  Left - Service Center Performance */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    Service Center Performance
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    Completed repair orders by service center
                </p>

                {loadingPerformance ? (
                    <p className="text-gray-500 text-sm">Loading data...</p>
                ) : errorPerformance ? (
                    <p className="text-red-500 text-sm">{errorPerformance}</p>
                ) : performanceData.length === 0 ? (
                    <p className="text-gray-500 text-sm">No data available</p>
                ) : (
                    <div className="space-y-4">
                        {performanceData.map((center, idx) => (
                            <div
                                key={center.scId || idx}
                                className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-3 rounded-xl transition-all"
                            >
                                <div>
                                    <h3 className="font-medium text-gray-800">{center.scName}</h3>
                                    <p className="text-sm text-gray-500">
                                        {center.totalCompletedOrder} completed orders
                                    </p>
                                </div>

                                {/*  Chỉ giữ lại % satisfaction — đã xóa phần “★ rating” */}
                                <div>
                                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">
                                        {85 + (idx % 10)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/*  Right - Resolution Time Distribution (Upgraded UI) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    Resolution Time Distribution
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    Breakdown of repair completion times
                </p>

                {loadingDuration ? (
                    <p className="text-gray-500 text-sm">Loading data...</p>
                ) : errorDuration ? (
                    <p className="text-red-500 text-sm">{errorDuration}</p>
                ) : durationData.length === 0 ? (
                    <p className="text-gray-500 text-sm">No duration data found.</p>
                ) : (
                    <>
                        {/*  Nâng cấp Bar Chart */}
                        <div className="h-80 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={durationData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                                    barSize={45}
                                >
                                    <defs>
                                        {/* Gradient theo nhóm thời gian */}
                                        <linearGradient id="barColorGood" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.9} />
                                            <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0.6} />
                                        </linearGradient>
                                        <linearGradient id="barColorNormal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                                            <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.6} />
                                        </linearGradient>
                                        <linearGradient id="barColorSlow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9} />
                                            <stop offset="95%" stopColor="#fde68a" stopOpacity={0.6} />
                                        </linearGradient>
                                        <linearGradient id="barColorLate" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                                            <stop offset="95%" stopColor="#fca5a5" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis
                                        dataKey="rangeLabel"
                                        tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "#6b7280", fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "rgba(59,130,246,0.06)" }}
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            borderRadius: "14px",
                                            border: "1px solid #e5e7eb",
                                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                                            fontSize: "13px",
                                            padding: "10px 14px",
                                        }}
                                        labelStyle={{ fontWeight: "600", color: "#111827" }}
                                    />
                                    <Bar
                                        dataKey="totalClaims"
                                        radius={[12, 12, 0, 0]}
                                        animationBegin={200}
                                        animationDuration={1200}
                                        animationEasing="ease-out"
                                        className="transition-all"
                                    >
                                        {durationData.map((entry, index) => {
                                            let fillColor = "url(#barColorNormal)";
                                            if (entry.rangeLabel === "< 1 day") fillColor = "url(#barColorGood)";
                                            else if (entry.rangeLabel === "3–7 days")
                                                fillColor = "url(#barColorSlow)";
                                            else if (entry.rangeLabel === "> 7 days")
                                                fillColor = "url(#barColorLate)";
                                            return <Cell key={`cell-${index}`} fill={fillColor} />;
                                        })}
                                        <LabelList
                                            dataKey="totalClaims"
                                            position="top"
                                            fill="#111827"
                                            fontSize={13}
                                            fontWeight={600}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/*  Thanh tiến trình (bảng phần trăm) */}
                        <div className="space-y-4">
                            {durationData.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm text-gray-700 mb-1">
                                        <span>{item.rangeLabel}</span>
                                        <span className="text-gray-500">
                                            {item.totalClaims} orders ({item.percent}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${item.percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PerformanceTab;
