import React, { useState, useEffect } from "react";
import { PlusCircle, Filter, Search } from "lucide-react";
import { getAllPartPoliciesApi } from "../../../services/api.service";
import PartPolicyTable from "./PartPolicyTable";
import ViewPartPolicyModal from "./ViewPartPolicy";
import CreatePartPolicy from "./CreatePartPolicy";

const PartPolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter, Search & Pagination - ĐÃ SỬA: Xóa filterPolicyId
  const [filterPartName, setFilterPartName] = useState("");
  const [filterPartCode, setFilterPartCode] = useState("");
  const [filterPolicyCode, setFilterPolicyCode] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch policies from API
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllPartPoliciesApi();

      const partPolicies =
        response.data?.data?.partPolicies || response.data?.data || [];
      setPolicies(partPolicies);
    } catch (err) {
      console.error("Error fetching part policies:", err);
      setError("Failed to load part policies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

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

  // Handle Delete
  const handleDelete = async (policy) => {
    if (
      !window.confirm(
        `Are you sure you want to delete part policy "${policy.partCode} - ${policy.partName}"?`
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await deletePartPolicyApi(policy.id);
      setSuccess("Part policy deleted successfully!");
      fetchPolicies(); // Refresh list
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete part policy.";
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
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

  return (
    <div className="p-6">
      {/* Header với Search Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          📘 Part Policy Management
        </h2>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by part name, code, or policy code..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Add New Button */}
          <button
            className="flex items-center bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md transition shadow-sm disabled:opacity-50"
            onClick={() => setShowCreateModal(true)}
            disabled={actionLoading}
          >
            <PlusCircle size={18} className="mr-2" />
            {actionLoading ? "Processing..." : "Add New Policy"}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-gray-700 font-medium">
          <Filter size={18} className="text-gray-600" />

          {/* Part Code */}
          <select
            value={filterPartCode}
            onChange={(e) => setFilterPartCode(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Part Codes</option>
            {availablePartCodes.map((code, i) => (
              <option key={i} value={code}>
                {code}
              </option>
            ))}
          </select>

          {/* Part Name */}
          <select
            value={filterPartName}
            onChange={(e) => setFilterPartName(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Part Names</option>
            {availableParts.map((part, i) => (
              <option key={i} value={part}>
                {part}
              </option>
            ))}
          </select>

          {/* Policy Code */}
          <select
            value={filterPolicyCode}
            onChange={(e) => setFilterPolicyCode(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Policy Codes</option>
            {availablePolicyCodes.map((code, i) => (
              <option key={i} value={code}>
                {code}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="expired">Expired</option>
          </select>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="text-sm text-blue-600 ml-2">
              Found {filteredPolicies.length} policies matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Table Component */}
      <PartPolicyTable
        policies={currentPolicies}
        loading={loading}
        onView={handleView}
        onDelete={handleDelete}
        actionLoading={actionLoading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredPolicies.length}
      />

      {/* Pagination */}
      {filteredPolicies.length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <span>
            Showing {startIndex + 1}–
            {Math.min(startIndex + itemsPerPage, filteredPolicies.length)} of{" "}
            {filteredPolicies.length} items
            {searchTerm && (
              <span className="text-blue-600 ml-2">for "{searchTerm}"</span>
            )}
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

      {/* Create Modal */}
      <CreatePartPolicy
        showModal={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setSuccess("Part policy created successfully!");
          setShowCreateModal(false);
          fetchPolicies(); // Refresh list
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
