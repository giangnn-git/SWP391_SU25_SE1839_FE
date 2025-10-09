import React, { useState } from "react";
import { PlusCircle, Filter, Eye } from "lucide-react";

// ✅ Dummy data
const dummyPolicies = [
  {
    partName: "Battery Module",
    policyId: "WP-001",
    startDate: "2024-01-10",
    endDate: "2025-01-10",
    status: "Active",
  },
  {
    partName: "Inverter Controller",
    policyId: "WP-002",
    startDate: "2023-07-01",
    endDate: "2024-07-01",
    status: "Expired",
  },
  {
    partName: "BMS Unit",
    policyId: "WP-001",
    startDate: "2024-04-15",
    endDate: "2025-04-15",
    status: "Active",
  },
  {
    partName: "Motor Assembly",
    policyId: "WP-003",
    startDate: "2022-09-01",
    endDate: "2023-09-01",
    status: "Expired",
  },
  {
    partName: "Charging Port",
    policyId: "WP-004",
    startDate: "2024-02-01",
    endDate: "2025-02-01",
    status: "Active",
  },
  {
    partName: "Cooling Fan",
    policyId: "WP-002",
    startDate: "2024-03-20",
    endDate: "2025-03-20",
    status: "Active",
  },
];

// ✅ Dropdown sources
const availableParts = [
  "Battery Module",
  "Inverter Controller",
  "BMS Unit",
  "Motor Assembly",
  "Charging Port",
  "Cooling Fan",
];
const availablePolicies = ["WP-001", "WP-002", "WP-003", "WP-004"];

const PartPolicyManagement = () => {
  const [policies, setPolicies] = useState(dummyPolicies);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [formData, setFormData] = useState({
    partName: "",
    policyId: "",
    startDate: "",
    endDate: "",
    status: "Active",
  });

  // ✅ Filter & Pagination
  const [filterPartName, setFilterPartName] = useState("");
  const [filterPolicyId, setFilterPolicyId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Filter logic
  const filteredPolicies = policies.filter((p) => {
    const matchPart = filterPartName ? p.partName === filterPartName : true;
    const matchPolicy = filterPolicyId ? p.policyId === filterPolicyId : true;
    const matchStatus = filterStatus ? p.status === filterStatus : true;
    return matchPart && matchPolicy && matchStatus;
  });

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPolicies = filteredPolicies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ✅ CRUD handlers
  const handleSave = () => {
    if (
      !formData.partName ||
      !formData.policyId ||
      !formData.startDate ||
      !formData.endDate
    ) {
      alert("Please fill in all fields before saving.");
      return;
    }

    if (editing) {
      setPolicies(
        policies.map((p) =>
          p.partName === editing.partName ? { ...p, ...formData } : p
        )
      );
    } else {
      setPolicies([...policies, { ...formData }]);
    }

    setShowModal(false);
    setEditing(null);
    setFormData({
      partName: "",
      policyId: "",
      startDate: "",
      endDate: "",
      status: "Active",
    });
  };

  const handleDelete = (partName) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      setPolicies(policies.filter((p) => p.partName !== partName));
    }
  };

  const handleView = (policy) => {
    setSelectedPolicy(policy);
    setShowViewModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          📘 Part Policy Management
        </h2>
        <button
          className="flex items-center bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md transition shadow-sm"
          onClick={() => setShowModal(true)}
        >
          <PlusCircle size={18} className="mr-2" />
          Add New Policy
        </button>
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
            {[...new Set(policies.map((p) => p.partName))].map((part, i) => (
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
            {[...new Set(policies.map((p) => p.policyId))].map((policy, i) => (
              <option key={i} value={policy}>
                {policy}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="min-w-full text-sm text-gray-700 border-separate border-spacing-y-1">
          <thead className="bg-gray-100 text-gray-900 font-semibold">
            <tr>
              <th className="py-3 px-4 text-left">Part Name</th>
              <th className="py-3 px-4 text-left">Policy ID</th>
              <th className="py-3 px-4 text-left">Start Date</th>
              <th className="py-3 px-4 text-left">End Date</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentPolicies.map((p, index) => (
              <tr
                key={index}
                className="bg-white border border-gray-200 hover:shadow-sm transition duration-100 h-[60px]"
              >
                <td
                  className="py-3 px-4 font-medium text-blue-600 hover:underline cursor-pointer"
                  onClick={() => handleView(p)}
                  title="Click to view details"
                >
                  {p.partName}
                </td>
                <td className="py-3 px-4">{p.policyId}</td>
                <td className="py-3 px-4">{p.startDate}</td>
                <td className="py-3 px-4">{p.endDate}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                {/*  Action Column */}
                <td className="py-3 px-4 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setFormData(p);
                        setShowModal(true);
                      }}
                      className="flex items-center justify-center w-9 h-9 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(p.partName)}
                      className="flex items-center justify-center w-9 h-9 rounded-md bg-red-500 hover:bg-red-600 text-white transition shadow-sm"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {currentPolicies.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No policies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>
          Showing {startIndex + 1}–
          {Math.min(startIndex + itemsPerPage, filteredPolicies.length)} of{" "}
          {filteredPolicies.length} items
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

      {/* Modal - Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[420px] p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "Edit Policy" : "Add New Policy"}
            </h2>

            <div className="space-y-3">
              <select
                value={formData.partName}
                onChange={(e) =>
                  setFormData({ ...formData, partName: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Part Name</option>
                {availableParts.map((part) => (
                  <option key={part} value={part}>
                    {part}
                  </option>
                ))}
              </select>

              <select
                value={formData.policyId}
                onChange={(e) =>
                  setFormData({ ...formData, policyId: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Policy ID</option>
                {availablePolicies.map((policy) => (
                  <option key={policy} value={policy}>
                    {policy}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />

              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                }}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ View Details Modal */}
      {showViewModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[460px] p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye size={20} className="text-gray-700" />
              Policy Details
            </h2>

            <div className="space-y-3 text-gray-700">
              <p>
                <b>Part Name:</b> {selectedPolicy.partName}
              </p>
              <p>
                <b>Policy ID:</b> {selectedPolicy.policyId}
              </p>
              <p>
                <b>Start Date:</b> {selectedPolicy.startDate}
              </p>
              <p>
                <b>End Date:</b> {selectedPolicy.endDate}
              </p>
              <p>
                <b>Status:</b>{" "}
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedPolicy.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedPolicy.status}
                </span>
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartPolicyManagement;
