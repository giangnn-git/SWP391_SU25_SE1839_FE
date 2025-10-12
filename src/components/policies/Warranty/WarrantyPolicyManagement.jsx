import { useState, useEffect } from "react";
import { PlusCircle, Filter, Search } from "lucide-react";
import {
  getAllWarrantyApi,
  createWarrantyPolicyApi,
  updateWarrantyPolicyApi,
  deleteWarrantyPolicyApi,
} from "../../../services/api.service";

import WarrantyPolicyTable from "./WarrantyPolicyTable";
import CreateEditWarrantyPolicyModal from "./CreateEditWarrantyPolicyModal";
import ViewWarrantyPolicyModal from "./ViewWarrantyPolicy";
import UpdateWarrantyPolicyModal from "./UpdateWarrantyPolicyModal";
import DeleteWarrantyPolicyModal from "./DeleteWarrantyPolicyModal";

const WarrantyPolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(""); // ✅ thêm state success message

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    durationPeriod: "",
    mileageLimit: "",
  });

  // ✅ Filter, Search & Pagination
  const [filterDuration, setFilterDuration] = useState("");
  const [filterMileage, setFilterMileage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Fetch policies from API
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllWarrantyApi();

      const transformedPolicies = response.data.data.policyList.map(
        (policy) => ({
          id: policy.id,
          name: policy.name || "Unnamed Policy",
          description: policy.description || "No description available",
          durationPeriod: `${policy.durationPeriod} months`,
          mileageLimit: `${policy.mileageLimit?.toLocaleString()} km`,
          originalData: policy,
        })
      );

      setPolicies(transformedPolicies);
    } catch (err) {
      console.error("Error fetching policies:", err);
      setError("Failed to load warranty policies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // ✅ CREATE
  const handleCreatePolicy = async (policyData) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess("");

      const apiData = {
        name: policyData.name,
        durationPeriod: parseInt(policyData.durationPeriod),
        mileageLimit: parseInt(policyData.mileageLimit),
        description: policyData.description,
      };

      await createWarrantyPolicyApi(apiData);
      await fetchPolicies();
      setSuccess("✅ Policy created successfully!");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating policy:", error);
      setError(
        error.response?.data?.message ||
        "Failed to create policy. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ UPDATE (open modal)
  const handleEdit = (policy) => {
    const selected = policy.originalData || policy;
    setSelectedPolicy(selected);
    setShowUpdateModal(true);
  };

  // ✅ DELETE (open modal)
  const handleDelete = (policy) => {
    const selected = policy.originalData || policy;
    setSelectedPolicy(selected);
    setShowDeleteModal(true);
  };

  // ✅ VIEW
  const handleView = (policy) => {
    setSelectedPolicy(policy);
    setShowViewModal(true);
  };

  // ✅ Filter, Search, Pagination
  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = searchTerm
      ? policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesDuration = filterDuration
      ? policy.durationPeriod === filterDuration
      : true;

    const matchesMileage = filterMileage
      ? policy.mileageLimit === filterMileage
      : true;

    return matchesSearch && matchesDuration && matchesMileage;
  });

  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPolicies = filteredPolicies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const availableDurations = [
    ...new Set(policies.map((p) => p.durationPeriod)),
  ];
  const availableMileages = [...new Set(policies.map((p) => p.mileageLimit))];

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDuration, filterMileage, searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  // ✅ Clear message after timeout
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (error && !policies.length) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
        <button
          onClick={fetchPolicies}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Search Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          🛡️ Warranty Policy Management
        </h2>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search policies..."
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

          {/* Add New */}
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

      {/* ✅ Message Area */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md shadow-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded-md shadow-sm">
          {success}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-gray-700 font-medium">
          <Filter size={18} className="text-gray-600" />
          <select
            value={filterDuration}
            onChange={(e) => setFilterDuration(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Duration Periods</option>
            {availableDurations.map((duration, i) => (
              <option key={i} value={duration}>
                {duration}
              </option>
            ))}
          </select>

          <select
            value={filterMileage}
            onChange={(e) => setFilterMileage(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Mileage Limits</option>
            {availableMileages.map((mileage, i) => (
              <option key={i} value={mileage}>
                {mileage}
              </option>
            ))}
          </select>

          {searchTerm && (
            <div className="text-sm text-blue-600 ml-2">
              Found {filteredPolicies.length} policies matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <WarrantyPolicyTable
        policies={currentPolicies}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
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

      {/* ✅ Create */}
      <CreateEditWarrantyPolicyModal
        showModal={showCreateModal}
        editing={false}
        formData={formData}
        actionLoading={actionLoading}
        onClose={() => setShowCreateModal(false)}
        onSave={() => handleCreatePolicy(formData)}
        onFormDataChange={(f, v) =>
          setFormData((prev) => ({ ...prev, [f]: v }))
        }
      />

      {/* ✅ View */}
      <ViewWarrantyPolicyModal
        showModal={showViewModal}
        selectedPolicy={selectedPolicy}
        onClose={() => setShowViewModal(false)}
      />

      {/* ✅ Update */}
      <UpdateWarrantyPolicyModal
        showModal={showUpdateModal}
        policy={selectedPolicy}
        onClose={() => setShowUpdateModal(false)}
        onUpdated={() => {
          fetchPolicies();
          setSuccess("✅ Policy updated successfully!");
        }}
        updatePolicyApi={updateWarrantyPolicyApi}
      />

      {/* ✅ Delete */}
      <DeleteWarrantyPolicyModal
        showModal={showDeleteModal}
        policy={selectedPolicy}
        onClose={() => setShowDeleteModal(false)}
        onDeleted={() => {
          fetchPolicies();
          setSuccess("🗑️ Policy deleted successfully!");
        }}
        deletePolicyApi={deleteWarrantyPolicyApi}
      />
    </div>
  );
};

export default WarrantyPolicyManagement;
