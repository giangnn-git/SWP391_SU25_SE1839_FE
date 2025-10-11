import React, { useState, useEffect } from "react";
import { PlusCircle, Filter, Search } from "lucide-react";
import { getAllPartPoliciesApi } from "../../../services/api.service";
import PartPolicyTable from "./PartPolicyTable";
import PartPolicyModal from "./PartPolicyModal";
import ViewPartPolicyModal from "./ViewPartPolicy";

const PartPolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    partName: "",
    policyId: "",
    startDate: "",
    endDate: "",
  });

  // Filter, Search & Pagination
  const [filterPartName, setFilterPartName] = useState("");
  const [filterPolicyId, setFilterPolicyId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch policies from API
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllPartPoliciesApi();

      // Transform API data
      const partPolicies = response.data?.data?.partPolicies || [];
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

  // Filter and Search logic - THÊM SEARCH THEO ID
  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = searchTerm
      ? policy.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.policyId.toString().includes(searchTerm) ||
        policy.id.toString().includes(searchTerm) // THÊM SEARCH THEO ID
      : true;

    const matchesPart = filterPartName
      ? policy.partName === filterPartName
      : true;

    const matchesPolicy = filterPolicyId
      ? policy.policyId.toString() === filterPolicyId
      : true;

    return matchesSearch && matchesPart && matchesPolicy;
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
  const availablePolicies = [
    ...new Set(policies.map((p) => p.policyId.toString())),
  ];

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterPartName, filterPolicyId, searchTerm]);

  // Create Policy
  const handleCreatePolicy = async (policyData) => {
    setActionLoading(true);
    setError("");
    try {
      await createPartPolicyApi(policyData);
      setSuccess("Part policy created successfully!");
      setShowCreateModal(false);
      fetchPolicies();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create part policy.";
      setError(errorMessage);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Policy
  const handleEditPolicy = async (id, policyData) => {
    setActionLoading(true);
    setError("");
    try {
      await updatePartPolicyApi(id, policyData);
      setSuccess("Part policy updated successfully!");
      setShowEditModal(false);
      setSelectedPolicy(null);
      fetchPolicies();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update part policy.";
      setError(errorMessage);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle View
  const handleView = (policy) => {
    setSelectedPolicy(policy);
    setShowViewModal(true);
  };

  // Handle Edit
  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setFormData({
      partName: policy.partName,
      policyId: policy.policyId.toString(),
      startDate: policy.startDate,
      endDate: policy.endDate,
    });
    setShowEditModal(true);
  };

  // Handle Save (Create or Edit) - SỬA LỖI QUAN TRỌNG
  const handleSave = async () => {
    const { partName, policyId, startDate, endDate } = formData;

    if (!partName || !policyId || !startDate || !endDate) {
      setError("Please fill in all fields before saving.");
      return;
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      setError("End date must be after start date.");
      return;
    }

    try {
      if (selectedPolicy) {
        // ✅ SỬA: Dùng id thay vì policyId
        await handleEditPolicy(selectedPolicy.id, formData);
      } else {
        // Create new policy
        await handleCreatePolicy(formData);
      }

      // Reset form
      setFormData({
        partName: "",
        policyId: "",
        startDate: "",
        endDate: "",
      });
    } catch (error) {
      // Error handled in individual functions
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
              placeholder="Search by part name, policy ID, or ID..."
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

          <select
            value={filterPolicyId}
            onChange={(e) => setFilterPolicyId(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Policy IDs</option>
            {availablePolicies.map((policy, i) => (
              <option key={i} value={policy}>
                {policy}
              </option>
            ))}
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
        onEdit={handleEdit}
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
      <PartPolicyModal
        showModal={showCreateModal}
        editing={false}
        formData={formData}
        actionLoading={actionLoading}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({
            partName: "",
            policyId: "",
            startDate: "",
            endDate: "",
          });
        }}
        onSave={handleSave}
        onFormDataChange={(field, value) =>
          setFormData((prev) => ({ ...prev, [field]: value }))
        }
      />

      {/* Edit Modal */}
      <PartPolicyModal
        showModal={showEditModal}
        editing={true}
        formData={formData}
        actionLoading={actionLoading}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPolicy(null);
          setFormData({
            partName: "",
            policyId: "",
            startDate: "",
            endDate: "",
          });
        }}
        onSave={handleSave}
        onFormDataChange={(field, value) =>
          setFormData((prev) => ({ ...prev, [field]: value }))
        }
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
