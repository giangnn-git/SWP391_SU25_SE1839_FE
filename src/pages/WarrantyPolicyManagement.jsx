import { useState, useEffect } from "react";
import { PlusCircle, Filter, Search } from "lucide-react";
import {
  getAllWarrantyApi,
  createWarrantyPolicyApi,
} from "../services/api.service";
import WarrantyPolicyTable from "../components/policies/WarrantyPolicyTable";
import CreateEditWarrantyPolicyModal from "../components/policies/CreateEditWarrantyPolicyModal";
import ViewWarrantyPolicyModal from "../components/policies/ViewWarrantyPolicy";

const WarrantyPolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editing, setEditing] = useState(null);
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

  // ✅ Create Policy Handler
  const handleCreatePolicy = async (policyData) => {
    try {
      setActionLoading(true);

      const apiData = {
        name: policyData.name,
        durationPeriod: parseInt(policyData.durationPeriod),
        mileageLimit: parseInt(policyData.mileageLimit),
        description: policyData.description,
      };

      await createWarrantyPolicyApi(apiData);
      await fetchPolicies();
    } catch (error) {
      console.error("Error creating policy:", error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Update Policy Handler
  const handleUpdatePolicy = async (id, policyData) => {
    try {
      setActionLoading(true);

      const apiData = {
        name: policyData.name,
        durationPeriod: parseInt(policyData.durationPeriod),
        mileageLimit: parseInt(policyData.mileageLimit),
        description: policyData.description,
      };

      await updateWarrantyPolicyApi(id, apiData);
      await fetchPolicies();
    } catch (error) {
      console.error("Error updating policy:", error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Delete Policy Handler
  const handleDeletePolicy = async (id) => {
    try {
      setActionLoading(true);
      await deleteWarrantyPolicyApi(id);
      await fetchPolicies();
    } catch (error) {
      console.error("Error deleting policy:", error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Save Handler (Create or Update)
  const handleSave = async () => {
    const { name, description, durationPeriod, mileageLimit } = formData;

    if (!name || !description || !durationPeriod || !mileageLimit) {
      alert("Please fill in all fields before saving.");
      return;
    }

    if (isNaN(durationPeriod) || isNaN(mileageLimit)) {
      alert("Duration Period and Mileage Limit must be numbers.");
      return;
    }

    try {
      if (editing) {
        await handleUpdatePolicy(editing.id, formData);
      } else {
        await handleCreatePolicy(formData);
      }

      setShowModal(false);
      setEditing(null);
      setFormData({
        name: "",
        description: "",
        durationPeriod: "",
        mileageLimit: "",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to save policy. Please try again.";
      alert(errorMessage);
    }
  };

  // ✅ Delete Handler
  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this warranty policy?")
    ) {
      try {
        await handleDeletePolicy(id);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to delete policy. Please try again.";
        alert(errorMessage);
      }
    }
  };

  // ✅ Handle View
  const handleView = (policy) => {
    setSelectedPolicy(policy);
    setShowViewModal(true);
  };

  // ✅ Handle Edit
  const handleEdit = (policy) => {
    setEditing(policy);
    setFormData({
      name: policy.name,
      description: policy.description,
      durationPeriod: policy.durationPeriod.replace(" months", ""),
      mileageLimit: policy.mileageLimit.replace(" km", "").replace(/,/g, ""),
    });
    setShowModal(true);
  };

  // ✅ Handle Form Data Change
  const handleFormDataChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Handle Modal Close
  const handleModalClose = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({
      name: "",
      description: "",
      durationPeriod: "",
      mileageLimit: "",
    });
  };

  // ✅ Filter and Search logic
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

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPolicies = filteredPolicies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ✅ Generate dynamic dropdown options
  const availableDurations = [
    ...new Set(policies.map((p) => p.durationPeriod)),
  ];
  const availableMileages = [...new Set(policies.map((p) => p.mileageLimit))];

  // ✅ Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDuration, filterMileage, searchTerm]);

  // ✅ Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  if (error) {
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
      {/* Header với Search Bar */}
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

          {/* Add New Button */}
          <button
            className="flex items-center bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md transition shadow-sm disabled:opacity-50"
            onClick={() => setShowModal(true)}
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

      {/* Table Component */}
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

      {/* Modals */}
      <CreateEditWarrantyPolicyModal
        showModal={showModal}
        editing={editing}
        formData={formData}
        actionLoading={actionLoading}
        onClose={handleModalClose}
        onSave={handleSave}
        onFormDataChange={handleFormDataChange}
      />

      <ViewWarrantyPolicyModal
        showModal={showViewModal}
        selectedPolicy={selectedPolicy}
        onClose={() => setShowViewModal(false)}
      />
    </div>
  );
};

export default WarrantyPolicyManagement;
