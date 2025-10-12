import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Search,
  Warehouse,
  Filter,
  Eye,
  RotateCcw,
} from "lucide-react";
import CreatePartModal from "../components/supply/CreatePartModal";
import ViewPartModal from "../components/supply/ViewPartModal";
import {
  getAllPartInventoriesApi,
  getPartInventoryByServiceCenterIdApi,
} from "../services/api.service";

const SupplyChain = () => {
  // =========================
  //  STATE
  // =========================
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState("");
  const [parts, setParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedServiceCenter, setSelectedServiceCenter] = useState("");

  // =========================
  //  FETCH API
  // =========================
  const fetchPartInventories = async (serviceCenterId = null) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setShowSuccess(false);

      const response = serviceCenterId
        ? await getPartInventoryByServiceCenterIdApi(serviceCenterId)
        : await getAllPartInventoriesApi();

      const data = response.data?.data || response.data;

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format from API");
      }

      const formatted = data.map((item) => ({
        id: item.id,
        code: item.partId ? `PART-${item.partId}` : "N/A",
        name: item.partName || "Unnamed Part",
        category: item.partCategory || "-",
        warehouse: item.serviceCenterName || "Unknown Warehouse",
        address: item.serviceCenterAddress || "Unknown Address",
        quantity: item.quantity ?? 0,
        lastUpdated: item.updatedAt || "",
      }));

      setParts(formatted);
      setSuccess(" Inventory data loaded successfully!");
      setShowSuccess(true);

      //  Ẩn sau 3 giây
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(" Error fetching part inventories:", err);
      setError("Failed to load part inventories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedServiceCenter) {
      fetchPartInventories(selectedServiceCenter);
    } else {
      fetchPartInventories();
    }
  }, [selectedServiceCenter]);

  // =========================
  //  FILTER & SEARCH
  // =========================
  const filteredParts = parts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = filterWarehouse
      ? p.warehouse === filterWarehouse
      : true;
    return matchesSearch && matchesWarehouse;
  });

  // =========================
  //  PAGINATION
  // =========================
  const totalPages = Math.ceil(filteredParts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentParts = filteredParts.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const uniqueWarehouses = [...new Set(parts.map((p) => p.warehouse))];

  // =========================
  //  ADD NEW PART (local only)
  // =========================
  const handleAddPart = (newPart) => {
    setParts([...parts, { ...newPart, id: Date.now() }]);
    setShowAddModal(false);
    setSuccess("✅ New part added (local only, not synced to API).");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // =========================
  //  UI RENDER
  // =========================
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Warehouse size={26} className="text-gray-800" />
            <h1 className="text-2xl font-semibold">Supply Chain Management</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage part stock and distribution across service centers
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fetchPartInventories(selectedServiceCenter || null)}
            className="flex items-center border border-gray-400 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md transition-all"
          >
            <RotateCcw size={18} className="mr-2" />
            Refresh
          </button>

          <button
            className="flex items-center bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md transition-all shadow-sm"
            onClick={() => setShowAddModal(true)}
          >
            <PlusCircle size={18} className="mr-2" />
            Add New Part
          </button>
        </div>
      </div>

      {/*  Notifications */}
      {loading && (
        <div className="text-center text-gray-500 py-6">
          Loading inventory data...
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md shadow-sm text-center">
          {error}
        </div>
      )}

      {showSuccess && success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded-md shadow-sm text-center transition-opacity duration-500">
          {success}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-gray-700 font-medium">
          <Filter size={18} className="text-gray-600" />

          <select
            value={selectedServiceCenter}
            onChange={(e) => setSelectedServiceCenter(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Service Centers</option>
            <option value="1">HCM Service Center</option>
            <option value="2">Hanoi Service Center</option>
            <option value="3">Danang Service Center</option>
          </select>

          <select
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Warehouses</option>
            {uniqueWarehouses.map((warehouse, index) => (
              <option key={index} value={warehouse}>
                {warehouse}
              </option>
            ))}
          </select>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full text-sm text-gray-700 border-separate border-spacing-y-1">
            <thead className="bg-gray-100 text-gray-900 font-semibold">
              <tr>
                <th className="py-3 px-4 text-left">Part Code</th>
                <th className="py-3 px-4 text-left">Part Name</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Warehouse</th>
                <th className="py-3 px-4 text-left">Address</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentParts.map((part) => (
                <tr
                  key={part.id}
                  className="bg-white border border-gray-200 hover:shadow-sm transition duration-100"
                >
                  <td className="py-3 px-4 font-medium">{part.code}</td>
                  <td className="py-3 px-4">{part.name}</td>
                  <td className="py-3 px-4">{part.category}</td>
                  <td className="py-3 px-4">{part.warehouse}</td>
                  <td className="py-3 px-4">{part.address}</td>
                  <td className="py-3 px-4 text-center font-semibold">
                    {part.quantity}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className="flex items-center justify-center w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 mx-auto"
                      title="View details"
                      onClick={() => {
                        setSelectedPart(part);
                        setShowViewModal(true);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {currentParts.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No parts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredParts.length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <span>
            Showing {startIndex + 1}–
            {Math.min(startIndex + itemsPerPage, filteredParts.length)} of{" "}
            {filteredParts.length} parts
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <CreatePartModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddPart}
        />
      )}

      {showViewModal && selectedPart && (
        <ViewPartModal
          part={selectedPart}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  );
};

export default SupplyChain;
