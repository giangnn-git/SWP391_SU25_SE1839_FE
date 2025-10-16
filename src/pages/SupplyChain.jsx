import React, { useState, useEffect } from "react";
import {
  Search,
  Warehouse,
  Filter,
  Eye,
  RotateCcw,
  LayoutGrid,
  Table,
  Download,
  PackageSearch,
  BarChart3,
} from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import ViewPartModal from "../components/supply/ViewPartModal";
import {
  getAllPartInventoriesApi,
  getPartInventoryByServiceCenterIdApi,
} from "../services/api.service";

const SupplyChain = () => {
  const { currentUser, loading } = useCurrentUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState("");
  const [parts, setParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table"); // "table" | "card"
  const itemsPerPage = 6;
  const [selectedServiceCenter, setSelectedServiceCenter] = useState("");
  const [serviceCenters, setServiceCenters] = useState([]);

  // =========================
  //  FETCH DATA
  // =========================
  const fetchPartInventories = async (serviceCenterId = null) => {
    try {
      setLoadingData(true);
      setError("");
      setSuccess("");
      setShowSuccess(false);

      const response = serviceCenterId
        ? await getPartInventoryByServiceCenterIdApi(serviceCenterId)
        : await getAllPartInventoriesApi();

      const data = response.data?.data || response.data;
      if (!Array.isArray(data))
        throw new Error("Invalid response format from API");

      const formatted = data.map((item) => ({
        id: item.id,
        code: item.partId ? `PART-${item.partId}` : "N/A",
        name: item.partName || "Unnamed Part",
        category: item.partCategory || "-",
        warehouse: item.serviceCenterName || "Unknown Warehouse",
        address: item.serviceCenterAddress || "Unknown Address",
        quantity: item.quantity ?? 0,
      }));

      setParts(formatted);
      setSuccess("Inventory data loaded successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("❌ Error fetching part inventories:", err);
      setError("Failed to load part inventories. Please try again.");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchServiceCenters = async () => {
    try {
      const res = await getAllPartInventoriesApi();
      const data = res.data?.data || [];
      const uniqueCenters = [
        ...new Map(
          data.map((item) => [
            item.serviceCenterId,
            {
              id: item.serviceCenterId,
              name: item.serviceCenterName,
              address: item.serviceCenterAddress,
            },
          ])
        ).values(),
      ];
      setServiceCenters(uniqueCenters);
    } catch (err) {
      console.error("❌ Error loading service centers:", err);
    }
  };

  useEffect(() => {
    fetchServiceCenters();
  }, []);

  useEffect(() => {
    if (selectedServiceCenter) fetchPartInventories(selectedServiceCenter);
    else fetchPartInventories();
  }, [selectedServiceCenter]);

  // =========================
  //  ROLE CHECK
  // =========================
  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">Loading user information...</div>
    );

  const isAuthorized =
    currentUser?.role?.toUpperCase() === "ADMIN" ||
    currentUser?.role?.toUpperCase() === "EVM_STAFF";

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50 text-gray-700">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md border border-gray-200">
          <h2 className="text-xl font-semibold text-red-600 mb-2">🚫 Access Denied</h2>
          <p className="text-sm text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  //  FILTER + PAGINATION
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

  const totalPages = Math.ceil(filteredParts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentParts = filteredParts.slice(startIndex, startIndex + itemsPerPage);
  const uniqueWarehouses = [...new Set(parts.map((p) => p.warehouse))];

  const getQuantityColor = (qty) => {
    if (qty > 50) return "text-green-600";
    if (qty >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  // =========================
  //  EXPORT CSV (mock)
  // =========================
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Part Code,Name,Category,Warehouse,Address,Quantity"]
        .concat(
          parts.map(
            (p) =>
              `${p.code},${p.name},${p.category},${p.warehouse},${p.address},${p.quantity}`
          )
        )
        .join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "SupplyChain_Export.csv";
    link.click();
  };

  // =========================
  //  DASHBOARD SUMMARY
  // =========================
  const totalQuantity = parts.reduce((sum, p) => sum + (p.quantity || 0), 0);

  // =========================
  //  UI
  // =========================
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen animate-fadeInScale">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 animate-fadeIn">
        <div>
          <div className="flex items-center gap-2">
            <PackageSearch size={28} className="text-blue-600 drop-shadow-sm" />
            <h1 className="text-3xl font-semibold text-gray-800">
              Supply Chain Management
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Monitor EV part distribution and stock levels across service centers
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fetchPartInventories(selectedServiceCenter || null)}
            className="flex items-center border border-gray-300 bg-white/80 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <RotateCcw size={18} className="mr-2 text-blue-600" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center border border-gray-300 bg-white/80 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <Download size={18} className="mr-2 text-green-600" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 animate-fadeInScale">
        {/* Total Warehouses */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-blue-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-all duration-300">
              <Warehouse size={28} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Warehouses</p>
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                {uniqueWarehouses.length}
              </h2>
            </div>
          </div>
          <div className="h-1 bg-blue-400/70 w-0 group-hover:w-full transition-all duration-700"></div>
        </div>

        {/* Total Parts */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-green-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-green-50 text-green-600 group-hover:bg-green-100 transition-all duration-300">
              <BarChart3 size={28} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Parts</p>
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                {parts.length}
              </h2>
            </div>
          </div>
          <div className="h-1 bg-green-400/70 w-0 group-hover:w-full transition-all duration-700"></div>
        </div>

        {/* Total Quantity */}
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-orange-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-all duration-300">
              <Table size={28} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Quantity</p>
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                {totalQuantity}
              </h2>
            </div>
          </div>
          <div className="h-1 bg-orange-400/70 w-0 group-hover:w-full transition-all duration-700"></div>
        </div>
      </div>


      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl p-4 mb-5 shadow-md animate-fadeInScale">
        <div className="flex flex-wrap items-center gap-3 text-gray-700 font-medium">
          <Filter size={18} className="text-blue-500" />

          <select
            value={selectedServiceCenter}
            onChange={(e) => setSelectedServiceCenter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          >
            <option value="">All Service Centers</option>
            {serviceCenters.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name} – {sc.address}
              </option>
            ))}
          </select>

          <select
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
            />
          </div>

          {/* View Switch */}
          <div className="ml-auto flex items-center gap-2">
            <button
              className={`p-2 rounded-lg transition ${viewMode === "table"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100 text-gray-600"
                }`}
              onClick={() => setViewMode("table")}
            >
              <Table size={18} />
            </button>
            <button
              className={`p-2 rounded-lg transition ${viewMode === "card"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100 text-gray-600"
                }`}
              onClick={() => setViewMode("card")}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Table / Card */}
      {!loadingData && viewMode === "table" && (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-100 animate-fadeIn">
          <table className="min-w-full text-sm text-gray-700 border-separate border-spacing-y-1">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-900 font-semibold shadow-sm">
              <tr>
                {["Code", "Name", "Category", "Warehouse", "Address", "Qty", "Actions"].map(
                  (h) => (
                    <th key={h} className="py-3 px-4 text-left">{h}</th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {currentParts.map((part) => (
                <tr
                  key={part.id}
                  className="bg-white hover:bg-blue-50/50 transition-all duration-150 border border-gray-100 hover:shadow-sm"
                >
                  <td className="py-3 px-4 font-medium text-gray-800">{part.code}</td>
                  <td className="py-3 px-4">{part.name}</td>
                  <td className="py-3 px-4">{part.category}</td>
                  <td className="py-3 px-4">{part.warehouse}</td>
                  <td className="py-3 px-4">{part.address}</td>
                  <td
                    className={`py-3 px-4 text-center font-semibold ${getQuantityColor(
                      part.quantity
                    )}`}
                  >
                    {part.quantity}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedPart(part);
                        setShowViewModal(true);
                      }}
                      title="View details"
                      className="flex items-center justify-center w-9 h-9 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg shadow-sm border border-blue-100 transition-all duration-200 hover:scale-105 active:scale-95 mx-auto"
                    >
                      <Eye size={18} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CARD VIEW */}
      {!loadingData && viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeInScale">
          {currentParts.map((part) => (
            <div
              key={part.id}
              className="bg-white/90 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">{part.name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getQuantityColor(part.quantity) === "text-green-600"
                    ? "bg-green-100 text-green-700"
                    : getQuantityColor(part.quantity) === "text-yellow-600"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {part.quantity} pcs
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Code:</strong> {part.code}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Category:</strong> {part.category}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Warehouse:</strong> {part.warehouse}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Address:</strong> {part.address}
              </p>
              <button
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 font-medium"
                onClick={() => {
                  setSelectedPart(part);
                  setShowViewModal(true);
                }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredParts.length > 0 && (
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600 animate-fadeIn">
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

      {/* View Modal */}
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
