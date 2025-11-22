import React, { useState, useEffect } from "react";
import {
  Search,
  Warehouse,
  Filter,
  Eye,
  LayoutGrid,
  Table,
  Download,
  PackageSearch,
  BarChart3,
  Building,
  Home,
} from "lucide-react";
import { storage } from "../utils/storage";
import { useCurrentUser } from "../hooks/useCurrentUser";
import ViewPartModal from "../components/supply/ViewPartModal";
import { getAllPartInventoriesApi } from "../services/api.service";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const SupplyChain = () => {
  const { currentUser, loading: userLoading } = useCurrentUser();

  // Lấy thông tin user từ hook và storage
  const userRole = currentUser?.role?.toUpperCase();

  // Xác định role và serviceCenterId
  const isEVMStaff = userRole === "EVM_STAFF";
  const isSCStaff = userRole === "SC_STAFF";
  const isAdmin = userRole === "ADMIN";
  const isAuthorized = isAdmin || isEVMStaff || isSCStaff;

  // Xác định userServiceCenterId dựa trên role
  const getServiceCenterId = () => {
    try {
      if (isEVMStaff) return null;
      const scid = localStorage.getItem("serviceCenterId");
      return scid && !isNaN(scid) ? parseInt(scid) : null;
    } catch {
      return null;
    }
  };

  const userServiceCenterId = getServiceCenterId();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState("");
  const [allParts, setAllParts] = useState([]);
  const [displayParts, setDisplayParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [activeTab, setActiveTab] = useState("main");
  const itemsPerPage = 6;

  // =========================
  //  FETCH ALL DATA
  // =========================
  const fetchAllPartInventories = async () => {
    try {
      setLoadingData(true);
      setError("");

      const response = await getAllPartInventoriesApi();
      const data = response.data?.data || response.data;

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format from API");
      }

      const formatted = data.map((item) => ({
        id: item.id,
        code: item.partCode || "N/A",
        name: item.partName || "Unnamed Part",
        category: item.partCategory || "-",
        warehouse: item.serviceCenterName || "Unknown Warehouse",
        address: item.serviceCenterAddress || "Unknown Address",
        quantity: item.quantity ?? 0,
        unit: item.unit || "UNKNOWN",
        partId: item.partId,
        serviceCenterId: item.serviceCenterId,
      }));

      setAllParts(formatted);
    } catch (err) {
      setError("Failed to load part inventories. Please try again.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthorized && !userLoading) {
      fetchAllPartInventories();
    }
  }, [userLoading]);

  // =========================
  //  FILTER LOGIC BASED ON ROLE & TAB
  // =========================
  useEffect(() => {
    if (allParts.length === 0 || userLoading) return;

    let filteredData = [...allParts];

    // FILTER THEO ROLE & TAB
    if (isSCStaff && userServiceCenterId) {
      filteredData = filteredData.filter(
        (item) => item.serviceCenterId === userServiceCenterId
      );
    } else if (isEVMStaff) {
      if (activeTab === "main") {
        // Kho tổng có serviceCenterId = null
        filteredData = filteredData.filter(
          (item) => item.serviceCenterId === null
        );
      } else if (activeTab === "branches") {
        // Các chi nhánh có serviceCenterId khác null
        filteredData = filteredData.filter(
          (item) => item.serviceCenterId !== null
        );
      }
    }

    // FILTER THEO SEARCH & WAREHOUSE
    filteredData = filteredData.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWarehouse = filterWarehouse
        ? p.warehouse === filterWarehouse
        : true;
      return matchesSearch && matchesWarehouse;
    });

    setDisplayParts(filteredData);
    setCurrentPage(1);
  }, [
    allParts,
    activeTab,
    searchTerm,
    filterWarehouse,
    userServiceCenterId,
    isEVMStaff,
    isSCStaff,
    userLoading,
  ]);

  // =========================
  //  ACCESS DENIED & LOADING
  // =========================
  if (userLoading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading user information...
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50 text-gray-700">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md border border-gray-200">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            🚫 Access Denied
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            You do not have permission to access this page.
          </p>
          <div className="text-xs bg-gray-100 p-3 rounded-lg text-left mt-4">
            <p>
              <strong>Your Role:</strong> {userRole || "Unknown"}
            </p>
            <p>
              <strong>Your Service Center ID:</strong>{" "}
              {userServiceCenterId || "null (Main Warehouse)"}
            </p>
            <p>
              <strong>Required Roles:</strong> ADMIN, EVM_STAFF, SC_STAFF
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  //  PAGINATION
  // =========================
  const totalPages = Math.ceil(displayParts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentParts = displayParts.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const uniqueWarehouses = [...new Set(displayParts.map((p) => p.warehouse))];

  const getQuantityColor = (qty) => {
    if (qty > 50) return "text-green-600";
    if (qty >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  // =========================
  //  EXPORT CSV
  // =========================
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Part Code,Name,Category,Warehouse,Address,Quantity,Unit"]
        .concat(
          displayParts.map(
            (p) =>
              `${p.code},${p.name},${p.category},${p.warehouse},${p.address},${p.quantity},${p.unit}`
          )
        )
        .join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "SupplyChain_Export.csv";
    link.click();
  };

  // =========================
  //  RENDER TABS (CHỈ CHO EVM_STAFF)
  // =========================
  const renderTabs = () => {
    if (!isEVMStaff) return null;

    return (
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-all ${activeTab === "main"
            ? "border-blue-600 text-blue-700 bg-blue-50"
            : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          onClick={() => setActiveTab("main")}
        >
          <Building size={18} />
          Central warehouse
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-all ${activeTab === "branches"
            ? "border-green-600 text-green-700 bg-green-50"
            : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          onClick={() => setActiveTab("branches")}
        >
          <Home size={18} />
          Service Center
        </button>
      </div>
    );
  };

  // =========================
  //  UI COMPONENTS
  // =========================
  const DashboardSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 animate-fadeInScale">
      <div className="group relative overflow-hidden bg-white rounded-2xl border border-blue-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative flex items-center gap-4 p-5">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-all duration-300">
            <Warehouse size={28} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Warehouses
            </p>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
              {uniqueWarehouses.length}
            </h2>
          </div>
        </div>
        <div className="h-1 bg-blue-400/70 w-0 group-hover:w-full transition-all duration-700"></div>
      </div>

      <div className="group relative overflow-hidden bg-white rounded-2xl border border-green-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative flex items-center gap-4 p-5">
          <div className="p-3 rounded-xl bg-green-50 text-green-600 group-hover:bg-green-100 transition-all duration-300">
            <BarChart3 size={28} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Parts</p>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
              {displayParts.length}
            </h2>
          </div>
        </div>
        <div className="h-1 bg-green-400/70 w-0 group-hover:w-full transition-all duration-700"></div>
      </div>

      <div
        className={`group relative overflow-hidden bg-white rounded-2xl border ${displayParts.filter((p) => p.quantity < 10).length > 0
          ? "border-orange-200 shadow-lg animate-pulse"
          : "border-gray-100"
          } shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative flex items-center gap-4 p-5">
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-all duration-300">
            <AlertTriangle size={28} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
              {displayParts.filter((p) => p.quantity < 10).length}
            </h2>
          </div>
        </div>
        <div className="h-1 bg-orange-400/70 w-0 group-hover:w-full transition-all duration-700"></div>
      </div>
    </div>
  );

  const FilterBar = () => (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl p-4 mb-5 shadow-md animate-fadeInScale">
      <div className="flex flex-wrap items-center gap-3 text-gray-700 font-medium">
        {!((isEVMStaff && activeTab === "main") || isSCStaff) && (
          <>
            <Filter size={18} className="text-blue-500" />
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
          </>
        )}

        {/* Search bar  */}
        <div
          className={`relative ${(isEVMStaff && activeTab === "main") || isSCStaff ? "mr-auto" : ""
            }`}
        >
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

        {/* View mode buttons  */}
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
  );

  // =========================
  //  MAIN RENDER
  // =========================
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen animate-fadeInScale">

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-2">
        <Link to="/" className="hover:underline text-blue-600">Dashboard</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">Supply Chain</span>
      </div>

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
            {isEVMStaff &&
              activeTab === "main" &&
              "Manage central warehouse inventory (Main Warehouse)"}
            {isEVMStaff &&
              activeTab === "branches" &&
              "Manage service center inventories"}
            {isSCStaff &&
              `Manage inventory of ${displayParts[0]?.warehouse || "your Service Center"
              }`}
            {isAdmin && "Manage all inventories across warehouses"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center border border-gray-300 bg-white/80 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <Download size={18} className="mr-2 text-green-600" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs (chỉ cho EVM_STAFF) */}
      {renderTabs()}

      {/* Dashboard Summary */}
      <DashboardSummary />

      {/* Filter Bar */}
      <FilterBar />

      {/* TABLE VIEW */}
      {!loadingData && viewMode === "table" && (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-100 animate-fadeIn">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-900 font-semibold">
              <tr>
                {[
                  "Code",
                  "Name",
                  "Category",
                  "Warehouse",
                  "Address",
                  "Quantity",
                  "Unit",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={`py-4 px-4 whitespace-nowrap ${["Quantity", "Unit", "Actions"].includes(h)
                      ? "text-center"
                      : "text-left"
                      }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentParts.map((part) => (
                <tr
                  key={part.id}
                  className="hover:bg-blue-50/30 transition-colors duration-150"
                >
                  <td className="py-4 px-4 align-middle font-medium text-gray-800 whitespace-nowrap">
                    {part.code}
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap">
                    {part.name}
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap">
                    {part.category}
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap">
                    {part.warehouse}
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap max-w-[200px] truncate">
                    {part.address}
                  </td>
                  <td
                    className={`py-4 px-4 text-center align-middle font-semibold whitespace-nowrap ${getQuantityColor(
                      part.quantity
                    )}`}
                  >
                    {part.quantity.toLocaleString()}
                  </td>
                  {/* UNIT  */}
                  <td className="py-4 px-4 text-center align-middle whitespace-nowrap">
                    <span className="inline-flex items-center justify-center min-w-[60px] px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                      {part.unit}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center align-middle whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedPart(part);
                        setShowViewModal(true);
                      }}
                      title="View details"
                      className="inline-flex items-center justify-center w-9 h-9 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg shadow-sm border border-blue-200 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <Eye size={18} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))}

              {currentParts.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-8 text-gray-500 italic"
                  >
                    No parts found.
                  </td>
                </tr>
              )}
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
      {displayParts.length > 0 && (
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600 animate-fadeIn">
          <span>
            Showing {startIndex + 1}–
            {Math.min(startIndex + itemsPerPage, displayParts.length)} of{" "}
            {displayParts.length} parts
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
