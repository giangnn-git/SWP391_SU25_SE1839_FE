import { useEffect, useState } from "react";
import {
  Loader, AlertCircle, TrendingUp, AlertTriangle, Package,
  ClipboardList, CheckCircle, Clock, Zap
} from "lucide-react";
import axios from "../services/axios.customize";

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [recentList, setRecentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("/api/api/dashboard/summary");
      const data = res.data?.data?.dashboardMap || {};
      const recent = res.data?.data?.recentActiveList || [];

      setSummary(data);
      setRecentList(recent);
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
      setError("Failed to load dashboard data. Please try again later.");
      setSummary({});
      setRecentList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const getMetricIcon = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes("claim") || lower.includes("yêu cầu")) return <ClipboardList size={24} />;
    if (lower.includes("order") || lower.includes("đơn")) return <Package size={24} />;
    if (lower.includes("complete") || lower.includes("hoàn")) return <CheckCircle size={24} />;
    if (lower.includes("urgent") || lower.includes("khẩn")) return <AlertTriangle size={24} />;
    if (lower.includes("performance") || lower.includes("hiệu")) return <TrendingUp size={24} />;
    return <Zap size={24} />;
  };

  const getMetricColor = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes("urgent") || lower.includes("khẩn") || lower.includes("emergency"))
      return { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600" };
    if (lower.includes("complete") || lower.includes("hoàn"))
      return { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600" };
    if (lower.includes("week") || lower.includes("tuần"))
      return { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600" };
    return { bg: "bg-gray-50", border: "border-gray-200", icon: "text-gray-600" };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Dashboard</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={fetchDashboardSummary}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">



      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to EV Warranty Management System
          </p>
        </div>

        {/* Claims & Orders */}
        {(summary.claims || summary.orders) && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Claims & Repair Orders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {summary.claims && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-white">
                        <ClipboardList className="text-blue-600" size={24} />
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                      Total Warranty Claims
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{summary.claims.count}</p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-white">
                        <AlertTriangle className="text-red-600" size={24} />
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                      Emergency Claims
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{summary.claims.emegency}</p>
                  </div>
                </>
              )}

              {summary.orders && (
                <>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-white">
                        <Package className="text-purple-600" size={24} />
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                      Orders This Week
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summary.orders.countOrderInOneWeek}
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-white">
                        <CheckCircle className="text-green-600" size={24} />
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                      Completed This Month
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summary.orders.completeOneMonth}
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Layout: Left (Recent) | Right (Performance + Quick) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Left side - Recent Activity */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-h-[500px] overflow-y-auto">
              {recentList.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {recentList.map((item, index) => (
                    <div key={index} className="p-4 hover:bg-blue-50 transition-colors duration-150">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 text-base">{item.title}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1 whitespace-pre-line">{item.vehicleInfo}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {item.timeAgo}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Clock className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium text-sm">No recent activity</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Activity will appear here as items are updated
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Performance Metrics + Quick Statistics */}
          <div className="space-y-6">

            {/* Performance Metrics */}
            {summary.performanceMetrics && Object.entries(summary.performanceMetrics).length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h2>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Metric</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(summary.performanceMetrics).map(([key, value]) => (
                        <tr key={key} className="hover:bg-blue-50 transition">
                          <td className="px-4 py-2 text-sm font-medium text-gray-700">{key}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${value}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-blue-600">{value}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Quick Statistics */}
            {summary.quickStatistics && Object.entries(summary.quickStatistics).length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Statistics</h2>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Statistic</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(summary.quickStatistics).map(([key, value]) => (
                        <tr key={key} className="hover:bg-green-50 transition">
                          <td className="px-4 py-2 text-sm font-medium text-gray-700">{key}</td>
                          <td className="px-4 py-2 text-sm font-bold text-gray-900">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </section>

        {/* Urgent Alerts full width */}
        {summary.urgentItems && Object.entries(summary.urgentItems).length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Urgent Alerts</h2>

            <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-red-100 px-4 py-3 border-b border-red-200 flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={18} />
                <span className="text-sm font-semibold text-red-800">Cảnh báo khẩn cấp</span>
              </div>

              {/* Content */}
              <div className="divide-y divide-red-100">
                {Object.entries(summary.urgentItems).map(([key, value]) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-6 py-4 transition-all duration-200 hover:bg-red-50 ${value > 0 ? "bg-red-50" : ""
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${value > 0 ? "bg-red-200 text-red-700" : "bg-gray-100 text-gray-500"
                          }`}
                      >
                        <AlertTriangle size={20} />
                      </div>
                      <p
                        className={`text-sm font-medium ${value > 0 ? "text-red-800" : "text-gray-700"
                          }`}
                      >
                        {key}
                      </p>
                    </div>

                    <span
                      className={`text-base font-bold px-3 py-1 rounded-lg ${value > 0
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}


      </div>
    </div>
  );
};

export default Dashboard;