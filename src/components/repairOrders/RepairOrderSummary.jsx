import { TrendingUp, Clock, CheckCircle, BarChart3, AlertCircle } from "lucide-react";

const RepairOrderSummary = ({ sor, loading, error }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-white rounded-lg border border-gray-200 animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
            </div>
        );
    }

    const cards = [
        {
            title: sor?.active?.message || "In-process order",
            value: sor?.active?.percentage ?? "–",
            icon: TrendingUp,
            color: "bg-blue-50",
            iconColor: "text-blue-600",
            labelColor: "text-blue-900",
        },
        {
            title: sor?.waitting?.message || "Waitting order",
            value: sor?.waitting?.percentage ?? "–",
            icon: Clock,
            color: "bg-amber-50",
            iconColor: "text-amber-600",
            labelColor: "text-amber-900",
        },
        {
            title: sor?.complete?.message || "Complete order",
            value: sor?.complete?.percentage ?? "–",
            icon: CheckCircle,
            color: "bg-green-50",
            iconColor: "text-green-600",
            labelColor: "text-green-900",
        },
        {
            title: sor?.avgComplete?.message || "Avg complete order",
            value: sor?.avgComplete?.percentage ?? "–",
            icon: BarChart3,
            color: "bg-purple-50",
            iconColor: "text-purple-600",
            labelColor: "text-purple-900",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div
                        key={idx}
                        className={`${card.color} border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200`}
                    >
                        <div className="flex items-start mb-3">
                            <div className="p-2 rounded-lg bg-white shadow-sm">
                                <Icon className={card.iconColor} size={20} />
                            </div>
                        </div>
                        <div>
                            <p className={`text-xs font-medium ${card.labelColor} mb-1 opacity-75`}>
                                {card.title}
                            </p>
                            <p className={`text-2xl font-bold ${card.labelColor}`}>{card.value}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default RepairOrderSummary;
