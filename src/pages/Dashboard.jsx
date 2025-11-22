import { useEffect, useState } from "react";
import {
  Loader, AlertCircle, TrendingUp, AlertTriangle, Package,
  ClipboardList, CheckCircle, Clock, Zap, DollarSign, Calendar
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
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


  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{payload[0].payload.month}</p>
          <p className="text-sm text-gray-600">
            Performance: <span className="font-bold text-blue-600">{payload[0].value}%</span>
          </p>
          {payload[0].payload.totalCostFormatted && (
            <p className="text-sm text-gray-600">
              Cost: <span className="font-bold text-green-600">{payload[0].payload.totalCostFormatted}$</span>

            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomTooltip1 = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{payload[0].payload.month}</p>
          {/* Show both series if present */}
          {payload.map((p, idx) => {
            const key = p.dataKey || p.name || `val-${idx}`;
            if (key === '_totalCost' || key === 'totalCost') {
              return (
                <p key={key} className="text-sm text-gray-600">
                  Cost: <span className="font-bold text-green-600">{p.payload.totalCostFormatted ?? `${p.value}$`}$</span>
                </p>
              );
            }
            // default to totalClaims / numeric series
            return (
              <p key={key} className="text-sm text-gray-600">
                Total: <span className="font-bold text-blue-600">{p.value}</span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
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

  const claimsBreakdown = summary.claimsBreakdown || {};
  const monthlyTrend = summary.monthlyTrend || [];
  const performanceMetrics = summary.performanceMetrics || {};
  const urgentItems = summary.urgentItems || {};
  const quickStats = summary.quickStatistics || {};

  // Compute yMax for Monthly Trend chart: prefer server-provided value if present,
  // otherwise compute from the data. Ensure non-zero to avoid zero-range axis.
  const monthlyMaxComputed = monthlyTrend.reduce((max, item) => {
    const val = Number(item?.totalClaims) || 0;
    return val > max ? val : max;
  }, 0);
  // Helper to round up to a 'nice' max for cleaner ticks (e.g., 2 -> 2, 3 -> 4, 7 -> 10).
  const getNiceMax = (n) => {
    if (!n || n <= 0) return 1;
    if (n <= 5) return Math.ceil(n);
    const pow = Math.pow(10, Math.floor(Math.log10(n)));
    const lead = Math.ceil(n / pow);
    const niceLead = lead <= 1 ? 1 : lead <= 2 ? 2 : lead <= 5 ? 5 : 10;
    return niceLead * pow;
  };

  // Use the max of `totalClaims` for the LEFT axis (claims count). Do NOT
  // use any server-provided yMax here because server yMax may be for cost.
  const yMax = getNiceMax(monthlyMaxComputed);
  const ticks = Array.from({ length: 5 }, (_, i) => {
    const t = (yMax * i) / 4;
    return Number(Number.isInteger(t) ? t : Number(t.toFixed(2)));
  });

  // --- Cost axis and data preparation ---
  const parseCost = (s) => {
    if (s == null) return 0;
    if (typeof s === 'number') return s;
    if (typeof s === 'string') {
      const n = Number(s.replace(/[^0-9.-]+/g, ''));
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const monthlyCostMaxComputed = monthlyTrend.reduce((max, item) => {
    const val = Number(item?.totalCost) || parseCost(item?.totalCostFormatted);
    return val > max ? val : max;
  }, 0);
  const costYMax = getNiceMax(monthlyCostMaxComputed);
  const costTicks = Array.from({ length: 5 }, (_, i) => {
    const t = (costYMax * i) / 4;
    return Number(Number.isInteger(t) ? t : Number(t.toFixed(2)));
  });

  // Prefer server-provided yMax for the base axis when available and numeric.
  // Backend fields checked (in order): `monthlyTrendYMax`, `monthlyTrendMax`, `yMax`.
  const serverYMaxCandidate = Number(summary?.monthlyTrendYMax ?? summary?.monthlyTrendMax ?? summary?.yMax ?? 0);
  const serverYMax = Number.isFinite(serverYMaxCandidate) && serverYMaxCandidate > 0 ? serverYMaxCandidate : null;

  // Decide a single axis max: prefer serverYMax if present, otherwise use the
  // larger of computed cost/claims and round to a 'nice' value.
  const computedBaseMax = Math.max(monthlyCostMaxComputed, monthlyMaxComputed);
  const defaultBaseYMax = getNiceMax(computedBaseMax);
  const baseYMax = serverYMax ?? defaultBaseYMax;
  const baseTicks = Array.from({ length: 5 }, (_, i) => {
    const t = (baseYMax * i) / 4;
    return Number(Number.isInteger(t) ? t : Number(t.toFixed(2)));
  });

  // Determine whether the base axis should be treated as cost (for formatting)
  const baseIsCost = (serverYMax !== null && monthlyCostMaxComputed > 0) ? true : (computedBaseMax === monthlyCostMaxComputed && monthlyCostMaxComputed > 0);

  // attach a numeric cost field for plotting
  const trendData = monthlyTrend.map((it) => ({
    ...it,
    _totalCost: Number(it?.totalCost) || parseCost(it?.totalCostFormatted),
  }));

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

        {/* Key Metrics Cards */}
        {(summary.claims || summary.orders) && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Total Claims */}
              {summary.claims && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <ClipboardList className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Total Warranty Claims
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {claimsBreakdown.total || summary.claims.count || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {claimsBreakdown.newToday || 0} new today
                  </p>
                </div>
              )}

              {/* Emergency Claims */}
              {summary.claims && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-red-50">
                      <AlertTriangle className="text-red-600" size={24} />
                    </div>
                    {summary.claims.emegency > 0 && (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    High Priority Claims
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {urgentItems['High Priority Claims'] || summary.claims.emegency || 0}
                  </p>
                  <p className="text-xs text-red-600">
                    {claimsBreakdown.pending || 0} pending review
                  </p>
                </div>
              )}

              {/* Orders This Week */}
              {summary.orders && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-purple-50">
                      <Package className="text-purple-600" size={24} />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Orders This Week
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {summary.orders.countOrderInOneWeek || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {summary.orders.differenceOneWeek >= 0 ? '+' : ''}{summary.orders.differenceOneWeek || 0}% vs last week
                  </p>
                </div>
              )}

              {/* Completed This Month */}
              {summary.orders && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <CheckCircle className="text-green-600" size={24} />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Completed This Month
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {Math.round(summary.orders.completeOneMonth) || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {quickStats['Completed Today'] || 0} completed today
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Quick Statistics Cards */}
        {quickStats && Object.keys(quickStats).length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Revenue This Week */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-50">
                    <DollarSign className="text-green-600" size={20} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Revenue This Week</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {quickStats['Revenue This Week'] || 0}$
                </p>
              </div>

              {/* Average Repair Days */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Calendar className="text-blue-600" size={20} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Average Repair Days</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {quickStats['Average Repair Days'] || 0} days
                </p>
              </div>

              {/* Completed Today */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <CheckCircle className="text-purple-600" size={20} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Completed Today</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {quickStats['Completed Today'] || 0} orders
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Monthly Trend Chart */}
          {monthlyTrend && monthlyTrend.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Claims Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} domain={[0, baseYMax]} ticks={baseTicks} tickFormatter={baseIsCost ? (v) => `${v}$` : undefined} />
                  <Tooltip content={<CustomTooltip1 />} />
                  <Line
                    type="monotone"
                    dataKey="totalClaims"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="_totalCost"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Performance Metrics Chart */}
          {performanceMetrics && Object.keys(performanceMetrics).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(performanceMetrics).map(([name, value]) => ({
                  name: name.length > 15 ? name.substring(0, 15) + '...' : name,
                  value: value,
                  fullName: name,
                  fill: value >= 80 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444'
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {Object.entries(performanceMetrics).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry[1] >= 80 ? '#22c55e' : entry[1] >= 50 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Claims Breakdown */}
        {claimsBreakdown && Object.keys(claimsBreakdown).length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Claims Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">New Today</p>
                <p className="text-2xl font-bold text-blue-600">{claimsBreakdown.newToday || 0}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">New This Week</p>
                <p className="text-2xl font-bold text-blue-600">{claimsBreakdown.newThisWeek || 0}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{claimsBreakdown.pending || 0}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Approved</p>
                <p className="text-2xl font-bold text-green-600">{claimsBreakdown.approved || 0}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{claimsBreakdown.rejected || 0}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{claimsBreakdown.draft || 0}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">{claimsBreakdown.total || 0}</p>
              </div>
            </div>
          </section>
        )}

        {/* Urgent Alerts */}
        {urgentItems && Object.keys(urgentItems).length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Urgent Alerts</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-100">
                {Object.entries(urgentItems).map(([key, value]) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 ${value > 0 ? 'bg-red-50' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${value > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <AlertTriangle
                          size={20}
                          className={value > 0 ? 'text-red-600' : 'text-gray-400'}
                        />
                      </div>
                      <p className={`text-sm font-medium ${value > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                        {key}
                      </p>
                    </div>
                    <span className={`text-lg font-bold px-4 py-1 rounded-lg ${value > 0 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recent Activity */}
        {recentList && recentList.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {recentList.map((item, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {item.status}
                      </span>
                    </div>
                    {item.vehicleInfo && (
                      <p className="text-sm text-gray-600 mb-1">{item.vehicleInfo}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} />
                      {item.timeAgo}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Total Warranty Cost */}

      </div>
    </div>
  );
};

export default Dashboard;