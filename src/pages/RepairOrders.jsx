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
  useEffect(() => {
    const channel = new BroadcastChannel("repair_order_updates");
    channel.onmessage = (event) => {
      console.log("📡 Received:", event.data);
      if (event.data?.type === "ORDER_UPDATED") {
        fetchRepairOrders(); // reload table
      }
    };

    return () => channel.close();
  }, []);

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-2">
        <Link to="/" className="hover:underline text-blue-600">Dashboard</Link>
        <span className="mx-1">/</span>
        <Link to="/repair-orders" className="text-gray-700 font-medium">Repair Orders</Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Repair Orders Management</h1>
        <p className="text-gray-600 text-sm mt-1">Manage and track all repair orders</p>
      </div>

      {/* Summary */}
      <RepairOrderSummary sor={sor} loading={loading} error={error} />

      {/* Search box (moved here) */}
      <div className="flex justify-start items-center mb-6 mt-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-2.5 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by VIN"
            className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

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
