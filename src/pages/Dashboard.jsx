import { useEffect, useState } from "react";
import axios from "../services/axios.customize";
import DashboardSummary from "../components/dashboard/DashboardSummary.jsx";

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        "/api/api/dashboard/summary"
      );
      const data = res.data?.data?.dashboarMap || {};
      setSummary(data);
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
      setError("Cannot load dashboard data.");
      setSummary({});
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">
          Welcome to EV Warranty Management System
        </p>
      </div>

      {/* Dashboard Summary */}
      <DashboardSummary summary={summary} loading={loading} error={error} />
    </div>
  );
};

export default Dashboard;
