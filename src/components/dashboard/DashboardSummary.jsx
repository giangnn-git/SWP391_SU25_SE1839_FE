import { Loader, AlertCircle, Car, ClipboardList, CheckCircle2 } from "lucide-react";

const DashboardSummary = ({ summary, loading, error }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
                <div className="text-center">
                    <Loader className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                <div>
                    <h3 className="font-semibold text-red-900">Error Loading Dashboard</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    const claims = summary?.claims || {};
    const orders = summary?.orders || {};

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Claims Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Total Claims</h3>
                    <p className="text-3xl font-bold text-blue-600">{claims.count || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Emergency: {claims.emegency || 0}
                    </p>
                </div>
                <ClipboardList size={36} className="text-blue-600 opacity-80" />
            </div>

            {/* Orders Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Orders This Week</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {orders.countOrderInOneWeek || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Difference: {orders.differenceOneWeek || 0}%
                    </p>
                </div>
                <Car size={36} className="text-green-600 opacity-80" />
            </div>

            {/* Completed Orders Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Monthly Complete Orders</h3>
                    <p className="text-3xl font-bold text-purple-600">
                        {orders.completeOneMonth || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Difference: {orders.differenceOneMonth || 0}%
                    </p>
                </div>
                <CheckCircle2 size={36} className="text-purple-600 opacity-80" />
            </div>
        </div>
    );
};

export default DashboardSummary;
