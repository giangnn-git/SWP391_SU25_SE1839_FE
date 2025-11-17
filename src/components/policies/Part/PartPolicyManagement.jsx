import React, { useState, useEffect } from "react";
import { PlusCircle, Filter, Search, X, Settings } from "lucide-react";
import { getAllPartPoliciesApi } from "../../../services/api.service";
import PartPolicyTable from "./PartPolicyTable";
import ViewPartPolicyModal from "./ViewPartPolicy";
import CreatePartPolicy from "./CreatePartPolicy";
import { updatePartPolicyStatusApi } from "../../../services/api.service";

const PartPolicyManagement = ({ refreshTrigger = 0 }) => {
  const [policies, setPolicies] = useState([]);
  const [originalPolicies, setOriginalPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter, Search & Pagination
  const [filterPartName, setFilterPartName] = useState("");
  const [filterPartCode, setFilterPartCode] = useState("");
  const [filterPolicyCode, setFilterPolicyCode] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "startDate", // 'startDate' hoặc 'endDate'
    direction: "asc", // 'asc', 'desc'
  });

  // Fetch policies from API
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllPartPoliciesApi();

      const partPolicies = response.data?.data?.partPolicies || [];
      setOriginalPolicies(partPolicies);

      // Sắp xếp theo cấu hình hiện tại
      const sortedPolicies = sortPolicies(partPolicies, sortConfig);
      setPolicies(sortedPolicies);
    } catch (err) {
      console.error("Error fetching part policies:", err);
      setError("Failed to load part policies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [refreshTrigger]);

  // Hàm sắp xếp policies
  const sortPolicies = (policiesToSort, config) => {
    if (!config.key) return policiesToSort;

    const sorted = [...policiesToSort].sort((a, b) => {
      const dateA = new Date(a[config.key]);
      const dateB = new Date(b[config.key]);

      if (config.direction === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    return sorted;
  };

  // Hàm xử lý sắp xếp
  const handleSort = (key, direction) => {
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);

    const sortedPolicies = sortPolicies(originalPolicies, newSortConfig);
    setPolicies(sortedPolicies);
    setCurrentPage(1);
  };

  // Filter and Search logic
  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = searchTerm
      ? policy.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.partCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.policyCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.id?.toString().includes(searchTerm)
      : true;

    const matchesPart = filterPartName
      ? policy.partName === filterPartName
      : true;

    const matchesPartCode = filterPartCode
      ? policy.partCode === filterPartCode
      : true;

    const matchesPolicyCode = filterPolicyCode
      ? policy.policyCode === filterPolicyCode
      : true;

    const matchesStatus =
      filterStatus === ""
        ? true
        : filterStatus === "available"
        ? new Date(policy.endDate) > new Date()
        : new Date(policy.endDate) <= new Date();

    return (
      matchesSearch &&
      matchesPart &&
      matchesPartCode &&
      matchesPolicyCode &&
      matchesStatus
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPolicies = filteredPolicies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Generate dynamic dropdown options
  const availableParts = [...new Set(policies.map((p) => p.partName))];
  const availablePartCodes = [...new Set(policies.map((p) => p.partCode))];
  const availablePolicyCodes = [
    ...new Set(policies.map((p) => p.policyCode)),
  ].sort();

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterPartName,
    filterPartCode,
    filterPolicyCode,
    filterStatus,
    searchTerm,
  ]);

  // Handle View
  const handleView = (policy) => {
    setSelectedPolicy(policy);
    setShowViewModal(true);
  };

  // Handle status toggle
  const handleStatusToggle = async (partPolicyId) => {
    setActionLoading(true);
    try {
      const response = await updatePartPolicyStatusApi(partPolicyId);
      await fetchPolicies();
      const updatedPolicy = response.data?.data;
      if (updatedPolicy) {
        const newStatus = updatedPolicy.status;
        setSuccess(
          `Policy ${
            newStatus === "ACTIVE" ? "activated" : "deactivated"
          } successfully!`
        );
      } else {
        setSuccess("Policy status updated successfully!");
      }
    } catch (err) {
      let errorMessage =
        err.response?.data?.errorCode ||
        err.response?.data?.message ||
        "Failed to update policy status. Please try again.";
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilterPartName("");
    setFilterPartCode("");
    setFilterPolicyCode("");
    setFilterStatus("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Clear messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  const isAnyFilterActive =
    filterPartName ||
    filterPartCode ||
    filterPolicyCode ||
    filterStatus ||
    searchTerm;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Settings size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Part Policy Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage part-specific warranty policies and components
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            onClick={() => setShowCreateModal(true)}
            disabled={actionLoading}
          >
            <PlusCircle size={18} />
            New Policy
          </button>
        </div>
      </div>

      {/* Message Area */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-green-700 font-medium">{success}</p>
          </div>
          <button
            onClick={() => setSuccess("")}
            className="text-green-500 hover:text-green-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Bar */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by part name, code, or policy code..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-gray-500" />

            <select
              value={filterPartCode}
              onChange={(e) => setFilterPartCode(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Part Codes</option>
              {availablePartCodes.map((code, i) => (
                <option key={i} value={code}>
                  {code}
                </option>
              ))}
            </select>

            <select
              value={filterPartName}
              onChange={(e) => setFilterPartName(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Part Names</option>
              {availableParts.map((part, i) => (
                <option key={i} value={part}>
                  {part}
                </option>
              ))}
            </select>

            <select
              value={filterPolicyCode}
              onChange={(e) => setFilterPolicyCode(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Policy Codes</option>
              {availablePolicyCodes.map((code, i) => (
                <option key={i} value={code}>
                  {code}
                </option>
              ))}
            </select>

            {isAnyFilterActive && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("")}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                filterStatus === ""
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("available")}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                filterStatus === "available"
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setFilterStatus("expired")}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                filterStatus === "expired"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Expired
            </button>
          </div>
        </div>

        {searchTerm && (
          <div className="mt-3 text-sm text-blue-600">
            Found {filteredPolicies.length} policies matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Table Component */}
      <PartPolicyTable
        policies={currentPolicies}
        loading={loading}
        onView={handleView}
        onStatusToggle={handleStatusToggle}
        actionLoading={actionLoading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredPolicies.length}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      {/* Pagination */}
      {filteredPolicies.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{startIndex + 1}</span>–
            <span className="font-semibold">
              {Math.min(startIndex + itemsPerPage, filteredPolicies.length)}
            </span>{" "}
            of <span className="font-semibold">{filteredPolicies.length}</span>{" "}
            policies
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <div className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium">
              Page {currentPage} of {totalPages || 1}
            </div>

            <button
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreatePartPolicy
        showModal={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setSuccess("Part policy created successfully!");
          setShowCreateModal(false);
          fetchPolicies();
        }}
      />

      {/* View Details Modal */}
      <ViewPartPolicyModal
        showModal={showViewModal}
        selectedPolicy={selectedPolicy}
        onClose={() => setShowViewModal(false)}
      />
    </div>
  );
};

export default PartPolicyManagement;
