import React from "react";
import { Clock4, CheckCircle2, XCircle } from "lucide-react";

const PartRequestSummary = ({ stats = {}, loading, error }) => {
    // ✅ Default data (khi chưa có API)
    const summaryData = [
        {
            label: "Pending Requests",
            value: stats.pending || 0,
            color: "yellow",
            icon: <Clock4 size={22} className="text-yellow-600" />,
        },
        {
            label: "Approved Requests",
            value: stats.approved || 0,
            color: "green",
            icon: <CheckCircle2 size={22} className="text-green-600" />,
        },
        {
            label: "Rejected Requests",
            value: stats.rejected || 0,
            color: "red",
            icon: <XCircle size={22} className="text-red-600" />,
        },
    ];

    if (loading)
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="animate-pulse bg-gray-100 rounded-2xl h-24 border border-gray-200"
                    />
                ))}
            </div>
        );

    if (error)
        return (
            <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl mb-6 text-sm">
                {error}
            </div>
        );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 animate-fadeIn">
            {summaryData.map((item, index) => (
                <div
                    key={index}
                    className={`relative overflow-hidden rounded-2xl border border-${item.color}-100 bg-${item.color}-50/70 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
                >
                    <div className="p-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600">
                                {item.label}
                            </h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {item.value}
                            </p>
                        </div>
                        <div
                            className={`p-3 rounded-full bg-${item.color}-100 shadow-inner`}
                        >
                            {item.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PartRequestSummary;
