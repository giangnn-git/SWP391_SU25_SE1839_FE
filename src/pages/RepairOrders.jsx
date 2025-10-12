import { useState, useEffect } from "react";
import { PlusCircle, Search } from "lucide-react";
import axios from "../services/axios.customize";
import RepairOrderModal from "../components/repairOrders/RepairOrderModal";
import RepairOrderTable from "../components/repairOrders/RepairOrderTable";

const RepairOrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch repair orders
  const fetchRepairOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/api/repairOrders");
      // 🔹 Giả định BE trả về dạng { data: { repairOrders: [...] } }
      setOrders(res.data?.data?.fors || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách Repair Orders!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairOrders();
  }, []);

  //  Khi tạo mới, thêm order vào đầu danh sách
  const handleOrderCreated = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  //  Tìm kiếm theo modelName hoặc VIN
  const filteredOrders = orders.filter((o) =>
    searchTerm
      ? o.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.vin?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">🛠 Repair Orders Management</h2>
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

          {/* <button
                        className="flex items-center bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md transition"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <PlusCircle size={18} className="mr-2" />
                        Thêm Repair Order
                    </button> */}
        </div>
      </div>

      {/* Table */}
      <RepairOrderTable
        orders={filteredOrders}
        loading={loading}
        error={error}
        fetchRepairOrders={fetchRepairOrders}
      />

      {/* Modal */}
      {/* {showCreateModal && (
                <RepairOrderModal
                    onClose={() => setShowCreateModal(false)}
                    onOrderCreated={handleOrderCreated}
                />
            )} */}
    </div>
  );
};

export default RepairOrdersManagement;
