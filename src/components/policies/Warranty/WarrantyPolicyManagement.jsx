import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  X,
} from "lucide-react";
import {
  getAllWarrantyApi,
  createWarrantyPolicyApi,
  updateWarrantyPolicyApi,
} from "../../../services/api.service";

import WarrantyPolicyTable from "./WarrantyPolicyTable";
import CreateEditWarrantyPolicyModal from "./CreateEditWarrantyPolicyModal";
import ViewWarrantyPolicyModal from "./ViewWarrantyPolicy";
import UpdateWarrantyPolicyModal from "./UpdateWarrantyPolicyModal";

const WarrantyPolicyManagement = ({ refreshTrigger = 0 }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // THÊM STATE formData Ở ĐÂY
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "NORMAL",
    durationPeriod: "",
    mileageLimit: "",
    description: "",
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter, Search & Pagination
  const [filterDuration, setFilterDuration] = useState("");
  const [filterMileage, setFilterMileage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch policies từ API
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllWarrantyApi();

      const transformedPolicies = response.data.data.policyList.map(
        (policy) => ({
          id: policy.id,
          code: policy.code,
          policyType: policy.policyType || "NORMAL",
          name: policy.name || "Unnamed Policy",
          description: policy.description || "No description available",
          durationPeriod: policy.durationPeriod,
          mileageLimit: policy.mileageLimit,
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

  // Fetch data khi component mount HOẶC khi refreshTrigger thay đổi
  useEffect(() => {
    fetchPolicies();
  }, [refreshTrigger]);

  // HÀM XỬ LÝ KHI MỞ MODAL CREATE - RESET FORM DATA
  const handleOpenCreateModal = () => {
    setFormData({
      code: "",
      name: "",
      type: "NORMAL",
      durationPeriod: "",
      mileageLimit: "",
      description: "",
    });
    setShowCreateModal(true);
  };

  // CREATE
  const handleCreatePolicy = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess("");

      const apiData = {
        code: formData.code.trim(),
        type: formData.type,
        name: formData.name,
        durationPeriod: parseInt(formData.durationPeriod),
        mileageLimit: parseInt(formData.mileageLimit),
        description: formData.description,
      };

      await createWarrantyPolicyApi(apiData);
      await fetchPolicies();
      setSuccess("Policy created successfully!");
      setShowCreateModal(false);

      // Reset form data sau khi tạo thành công
      setFormData({
        code: "",
        name: "",
        type: "NORMAL",
        durationPeriod: "",
        mileageLimit: "",
        description: "",
      });
    } catch (error) {
      console.error("Error creating policy:", error);
      const errorMessage =
        error.response?.data?.errorCode ||
        error.response?.data?.message ||
        "Failed to create policy. Please try again.";
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // UPDATE
  const handleEdit = (policy) => {
    const selected = policy.originalData || policy;
    setSelectedPolicy(selected);
    setActionLoading(false);
    setShowUpdateModal(true);
  };

  // VIEW
  const handleView = (policy) => {
    setSelectedPolicy(policy);
    setShowViewModal(true);
  };

  // Filter and Search logic
  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = searchTerm
      ? policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.code.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesDuration = filterDuration
      ? policy.durationPeriod === parseInt(filterDuration)
      : true;

    const matchesMileage = filterMileage
      ? policy.mileageLimit === parseInt(filterMileage)
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

  const clearFilters = () => {
    setFilterDuration("");
    setFilterMileage("");
    setSearchTerm("");
  };

  // Clear message after timeout
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
      <div className="p-6 flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
        <XCircle size={48} className="text-red-400 mb-4" />
        <div className="text-lg text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchPolicies}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <Shield size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Warranty Policy Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and organize your vehicle warranty policies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            onClick={handleOpenCreateModal}
            disabled={actionLoading}
          >
            <PlusCircle size={18} />
            {actionLoading ? "Processing..." : "New Policy"}
          </button>
        </div>
      </div>

      {/* Message Area */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <XCircle size={20} className="text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
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
                placeholder="Search policies by name, code or description..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
              value={filterDuration}
              onChange={(e) => setFilterDuration(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">All Durations</option>
              {availableDurations.map((duration, i) => (
                <option key={i} value={duration}>
                  {duration} months
                </option>
              ))}
            </select>

            <select
              value={filterMileage}
              onChange={(e) => setFilterMileage(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">All Mileages</option>
              {availableMileages.map((mileage, i) => (
                <option key={i} value={mileage}>
                  {mileage.toLocaleString()} km
                </option>
              ))}
            </select>

            {(filterDuration || filterMileage || searchTerm) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <WarrantyPolicyTable
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

      {/* Modals */}
      <CreateEditWarrantyPolicyModal
        showModal={showCreateModal}
        editing={false}
        formData={formData}
        actionLoading={actionLoading}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreatePolicy}
        onFormDataChange={(field, value) =>
          setFormData((prev) => ({ ...prev, [field]: value }))
        }
      />

      <ViewWarrantyPolicyModal
        showModal={showViewModal}
        selectedPolicy={selectedPolicy}
        onClose={() => setShowViewModal(false)}
      />

      <UpdateWarrantyPolicyModal
        showModal={showUpdateModal}
        policy={selectedPolicy}
        actionLoading={actionLoading}
        onClose={() => setShowUpdateModal(false)}
        onUpdated={() => {
          fetchPolicies();
          setSuccess("Policy updated successfully!");
        }}
        updatePolicyApi={updateWarrantyPolicyApi}
      />
    </div>
  );
};

export default WarrantyPolicyManagement;
