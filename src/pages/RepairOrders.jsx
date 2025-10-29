import { useState, useEffect } from "react";
import { PlusCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";

import axios from "../services/axios.customize";
import RepairOrderTable from "../components/repairOrders/RepairOrderTable";
import RepairOrderSummary from "../components/repairOrders/RepairOrderSummary";


const RepairOrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [sor, setSor] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRepairOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/api/repair-orders");
      setOrders(res.data?.data?.fors || []);
      setSor(res.data?.data?.sor || []);
    } catch (err) {
      console.error(err);
      setError("Can not load Repair Orders!");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchRepairOrders();
  }, []);

  const handleOrderCreated = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const filteredOrders = orders.filter((o) =>
    searchTerm
      ? o.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.vin?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <div className="p-6">

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-2">
        <Link to="/" className="hover:underline text-blue-600">Dashboard</Link>
        <span className="mx-1">/</span>
        <Link to="/repair-orders" className="text-gray-700 font-medium">Repair Orders</Link>
        <span className="mx-1"></span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Repair Orders Management</h1>
          <p className="text-gray-600 text-sm mt-1">Manage and track all repair orders</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo model hoặc VIN..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

        </div>
      </div>

      <RepairOrderSummary sor={sor} loading={loading} error={error} />

      {/* Table */}
      <RepairOrderTable
        orders={filteredOrders}
        loading={loading}
        error={error}
        fetchRepairOrders={fetchRepairOrders}
        setOrders={setOrders}
      />

    </div>
  );
};

export default RepairOrdersManagement;
