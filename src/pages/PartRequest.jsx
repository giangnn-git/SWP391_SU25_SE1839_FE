import { useState, useEffect } from "react";
import {
  PlusCircle,
  Search,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAllPartRequestsApi,
  createPartRequestApi,
  getAllPartsApi,
  getPartRequestDetailApi,
} from "../services/api.service";

/* ================== Helpers ================== */
const REMARK_IN = "In stock";
const REMARK_OUT = "Out of stock";

// Helper function để chuyển đổi date array thành timestamp để so sánh
const getTimestampFromDateArray = (arr) => {
  if (!Array.isArray(arr)) return 0;
  const [y, m, d, hh, mm] = arr;
  return new Date(y, m - 1, d, hh, mm).getTime();
};

const formatDate = (arr) => {
  if (!Array.isArray(arr)) return "-";
  const [y, m, d, hh, mm] = arr;

  return (
    <div className="flex flex-col">
      <span>
        {d.toString().padStart(2, "0")}/{m.toString().padStart(2, "0")}/{y}
      </span>
      <span className="text-xs text-gray-500">
        {hh.toString().padStart(2, "0")}:{mm.toString().padStart(2, "0")}
      </span>
    </div>
  );
};

const toInt = (v, fallback = 0) => {
  if (v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const normalizePartDetail = (detail, requestStatus) => {
  const requestedQty = toInt(detail.requestedQuantity);

  const hasEVMData = detail.approvedQuantity !== null || detail.remark !== null;

  const approvedQty = hasEVMData ? toInt(detail.approvedQuantity) : null;
  const remark = hasEVMData ? (approvedQty > 0 ? REMARK_IN : REMARK_OUT) : null;

  return {
    ...detail,
    partCode: detail.partCode || "-",
    partName: detail.partName || detail.partCode || "-",
    requestedQuantity: requestedQty,
    approvedQuantity: approvedQty,
    remark: remark,
    hasEVMData: hasEVMData,
  };
};
/* ================== SUMMARY ================== */
const PartRequestSummary = ({ summary, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
        <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
        <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fadeIn">
      {[
        { label: "Pending Requests", value: summary?.pending, color: "yellow" },
        {
          label: "Approved Requests",
          value: summary?.approved,
          color: "green",
        },
        { label: "Rejected Requests", value: summary?.rejected, color: "red" },
      ].map((item, i) => (
        <div
          key={i}
          className={`bg-${item.color}-50 border border-${item.color}-200 p-5 rounded-xl shadow-sm hover:shadow-md transition`}
        >
          <p className="text-sm font-medium text-gray-700">{item.label}</p>
          <h3 className={`text-3xl font-bold text-${item.color}-600 mt-1`}>
            {item.value || 0}
          </h3>
        </div>
      ))}
    </div>
  );
};

/* ================== TABLE ================== */
const PartRequestTable = ({
  requests,
  loading,
  error,
  onView,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemsPerPage,
  sortBy,
  onSortChange,
}) => {
  if (loading)
    return (
      <div className="text-center py-6 text-gray-500">Loading requests...</div>
    );

  if (error)
    return (
      <div className="text-center py-6 text-red-600">
        Failed to load requests.
      </div>
    );

  if (!requests.length)
    return (
      <div className="text-center py-10 text-gray-500 italic">
        No part requests found.
      </div>
    );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-blue-50 border-b border-gray-200">
          <tr>
            <th className="py-3 px-4 text-left font-semibold">
              Service Center
            </th>
            <th className="py-3 px-4 text-left font-semibold">Created By</th>
            <th className="py-3 px-4 text-left font-semibold">
              <div className="flex items-center gap-1 cursor-pointer group">
                <span>Created Date</span>
                <div className="relative">
                  <button className="flex items-center justify-center w-6 h-6 hover:bg-blue-100 rounded transition">
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>

                  {/* Dropdown menu */}
                  <div className="absolute left-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button
                      onClick={() => onSortChange("date_asc")}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg ${sortBy === "date_asc" ? "bg-blue-50 text-blue-600" : ""
                        }`}
                    >
                      ↑ Date Ascending
                    </button>
                    <button
                      onClick={() => onSortChange("date_desc")}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg ${sortBy === "date_desc" ? "bg-blue-50 text-blue-600" : ""
                        }`}
                    >
                      ↓ Date Descending
                    </button>
                  </div>
                </div>
              </div>
            </th>
            <th className="py-3 px-4 text-left font-semibold">Status</th>
            <th className="py-3 px-4 text-left font-semibold">Note</th>
            <th className="py-3 px-4 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr
              key={r.id}
              className="border-b border-gray-100 hover:bg-blue-50/40 transition"
            >
              <td className="py-3 px-4">{r.serviceCenterName}</td>
              <td className="py-3 px-4">{r.createdBy}</td>
              <td className="py-3 px-4">{formatDate(r.createdDate)}</td>
              <td className="py-3 px-4">
                {r.status === "PENDING" ? (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-medium">
                    Pending
                  </span>
                ) : r.status === "APPROVED" ? (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                    Approved
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                    Rejected
                  </span>
                )}
              </td>
              <td className="py-3 px-4">{r.note}</td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => onView(r)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition text-xs flex items-center gap-1 mx-auto"
                >
                  <Eye size={14} /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION COMPONENT */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{startIndex + 1}</span>-
            <span className="font-semibold">{endIndex}</span> of{" "}
            <span className="font-semibold">{totalItems}</span> requests
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                )
                .map((page, index, array) => (
                  <div key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================== VIEW MODAL ================== */
const ViewPartRequestModal = ({ request, onClose }) => {
  if (!request) return null;

  const normalizedDetails = Array.isArray(request.details)
    ? request.details.map((detail) =>
      normalizePartDetail(detail, request.status)
    )
    : [];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 border border-gray-100 animate-slideUp">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Eye size={18} className="text-blue-600" /> Request Details
        </h2>

        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <b>ID:</b> {request.id}
          </p>
          <p>
            <b>Service Center:</b> {request.serviceCenterName}
          </p>
          <p>
            <b>Created By:</b> {request.createdBy}
          </p>
          <p>
            <b>Status:</b>
            <span
              className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${request.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-700"
                  : request.status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
            >
              {request.status}
            </span>
          </p>
          <p>
            <b>Note:</b> {request.note || "-"}
          </p>
          <p>
            <b>Created Date:</b> {formatDate(request.createdDate)}
          </p>

          {normalizedDetails.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Parts Requested:
              </h3>
              <div className="space-y-2">
                {normalizedDetails.map((part, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg bg-gray-50 flex flex-col text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-800">
                        {part.partCode}
                      </span>
                      <span className="text-gray-500">
                        Requested: {part.requestedQuantity}
                      </span>
                    </div>

                    {part.hasEVMData ? (
                      <div className="flex justify-between text-gray-600 mt-1">
                        <span>Approved: {part.approvedQuantity}</span>
                        <span>
                          Remark:{" "}
                          <span
                            className={
                              part.remark === REMARK_OUT
                                ? "text-red-600 font-medium"
                                : "text-green-600 font-medium"
                            }
                          >
                            {part.remark}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs mt-1 italic">
                        Waiting for EVM staff review...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================== CREATE MODAL ================== */
const CreatePartRequestModal = ({ onClose, onCreated }) => {
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = useState([
    { category: "", partId: "", quantity: "" },
  ]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await getAllPartsApi();
        if (res.status === 200 && res.data?.data?.partList) {
          const list = res.data.data.partList;
          setParts(list);
          setCategories([...new Set(list.map((p) => p.partCategory))]);
          setError("");
        } else {
          setError("⚠️ Unexpected response format from server.");
        }
      } catch (err) {
        setError("Failed to load part list.");
      }
    };
    fetchParts();
  }, []);

  const handleChange = (idx, key, value) => {
    const newRows = [...rows];
    newRows[idx][key] = value;
    if (key === "category") newRows[idx].partId = "";
    setRows(newRows);
  };

  const handleAdd = () =>
    setRows([...rows, { category: "", partId: "", quantity: "" }]);
  const handleRemove = (idx) => setRows(rows.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!note.trim()) {
      setError("Please enter a note.");
      return;
    }
    const invalid = rows.some(
      (r) => !r.partId || !r.quantity || parseInt(r.quantity) <= 0
    );
    if (invalid) {
      setError("Please fill all part details correctly.");
      return;
    }

    const details = rows.map((r) => {
      const part = parts.find((p) => p.id === parseInt(r.partId));
      return {
        partCode: part?.code || "",
        partName: part?.name || "",
        requestedQuantity: parseInt(r.quantity),
        partId: parseInt(r.partId),
      };
    });

    const payload = {
      note: note.trim(),
      details: details,
    };

    try {
      setLoading(true);
      const res = await createPartRequestApi(payload);

      if (res?.status === 200 || res?.status === 201) {
        setSuccess(" Request created successfully!");
        onCreated();
        setTimeout(() => onClose(), 1500);
      } else {
        setError(" Backend returned unexpected status.");
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;

        if (status === 500) {
          if (data?.errorCode?.includes("Failed to convert value")) {
            setError(
              " Server error: Invalid data format. Please check part selection."
            );
          } else {
            setError(" Server error. Please try again.");
          }
        } else if (status === 400) {
          setError(" Bad request. Please check your input data.");
        } else {
          setError(` Error ${status}: ${data?.message || "Unknown error"}`);
        }
      } else {
        setError(" Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fadeIn p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100 animate-slideUp">


        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <PlusCircle size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  New Part Request
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Add parts needed for warranty service
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Parts Section */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-lg font-semibold text-gray-800">
                  Requested Parts
                </label>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-md border">
                  {rows.length} part(s)
                </span>
              </div>

              <div className="space-y-4">
                {rows.map((row, idx) => {
                  const filtered = parts.filter(
                    (p) => p.partCategory === row.category
                  );
                  return (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Category Select */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Category
                            </label>
                            <select
                              value={row.category}
                              onChange={(e) =>
                                handleChange(idx, "category", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            >
                              <option value="">Select Category</option>
                              {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Part Select */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Part
                            </label>
                            <select
                              value={row.partId}
                              onChange={(e) =>
                                handleChange(idx, "partId", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                              disabled={!row.category}
                            >
                              <option value="">Select Part</option>
                              {filtered.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.code})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity Input */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quantity
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="Qty"
                                value={row.quantity}
                                onChange={(e) =>
                                  handleChange(idx, "quantity", e.target.value)
                                }
                                min="1"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                              />
                              {rows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemove(idx)}
                                  className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                  title="Remove part"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mt-4 p-3 hover:bg-blue-50 rounded-lg transition-colors w-full justify-center border-2 border-dashed border-blue-200"
              >
                <PlusCircle size={20} />
                Add Another Part
              </button>
            </div>

            {/* Note Section */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Request Note <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Enter reason for part request, vehicle details, or any special instructions..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                required
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  Provide details about why these parts are needed
                </span>
                <span
                  className={`text-xs ${note.length > 200 ? "text-red-500" : "text-gray-500"
                    }`}
                >
                  {note.length}/500
                </span>
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <div className="p-1 bg-red-100 rounded-full mt-0.5">
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <div className="p-1 bg-green-100 rounded-full mt-0.5">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Success</p>
                  <p className="text-sm text-green-700 mt-1">{success}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 min-w-[100px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-xl text-sm font-medium text-white transition min-w-[120px] ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-sm"
                  }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  "Create Request"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ================== MAIN PAGE ================== */
const PartRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sortBy, setSortBy] = useState("date_desc"); // Mặc định sắp xếp mới nhất trước

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getAllPartRequestsApi();
      let data = res.data?.data?.partSupplies || [];
      setRequests(data);
    } catch (err) {
      setError("Failed to fetch part requests!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleNewRequestCreated = () => {
    fetchRequests();
    setCurrentPage(1);
  };

  const handleViewRequest = async (req) => {
    try {
      const res = await getPartRequestDetailApi(req.id);
      const rawData = res.data?.data || req;

      const normalizedData = {
        ...rawData,
        details: Array.isArray(rawData.details)
          ? rawData.details.map((detail) =>
            normalizePartDetail(detail, rawData.status)
          )
          : [],
      };

      setSelectedRequest(normalizedData);
    } catch (err) {
      const normalizedData = {
        ...req,
        details: [],
      };
      setSelectedRequest(normalizedData);
    }
  };

  // Hàm sắp xếp requests
  const getSortedRequests = (requests) => {
    const filtered = requests.filter((r) => {
      const matchSearch = searchTerm
        ? r.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.serviceCenterName?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchStatus =
        statusFilter === "all"
          ? true
          : r.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });

    // Sắp xếp theo ngày
    return filtered.sort((a, b) => {
      const aTimestamp = getTimestampFromDateArray(a.createdDate);
      const bTimestamp = getTimestampFromDateArray(b.createdDate);

      if (sortBy === "date_asc") {
        return aTimestamp - bTimestamp; // Cũ đến mới
      } else {
        return bTimestamp - aTimestamp; // Mới đến cũ (mặc định)
      }
    });
  };

  const sortedRequests = getSortedRequests(requests);
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequests = sortedRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, sortBy]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const summaryStats = {
    pending: requests.filter((r) => r.status === "PENDING").length,
    approved: requests.filter((r) => r.status === "APPROVED").length,
    rejected: requests.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="text-sm text-gray-500 mb-2">
        <Link to="/" className="hover:underline text-blue-600">
          Dashboard
        </Link>
        <span className="mx-1">/</span>
        <Link to="/part-requests" className="text-gray-700 font-medium">
          Part Requests
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Part Request Management
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Review and manage all part replacement requests from service centers.
        </p>
      </div>

      <PartRequestSummary
        summary={summaryStats}
        loading={loading}
        error={error}
      />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by note or service center..."
              className="w-72 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <PlusCircle size={18} /> New Request
        </button>
      </div>

      <PartRequestTable
        requests={currentRequests}
        loading={loading}
        error={error}
        onView={handleViewRequest}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedRequests.length}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />

      {selectedRequest && (
        <ViewPartRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {showCreateModal && (
        <CreatePartRequestModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleNewRequestCreated}
        />
      )}
    </div>
  );
};

export default PartRequestManagement;
