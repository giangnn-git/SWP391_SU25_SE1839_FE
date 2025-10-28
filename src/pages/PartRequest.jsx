import { useState, useEffect } from "react";
import { PlusCircle, Search, Trash2, Eye } from "lucide-react";
import axios from "../services/axios.customize";
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

const toInt = (v, fallback = 0) => {
  if (v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeRemark = (r) => {
  if (!r) return "";
  const s = String(r).trim().toLowerCase().replace(/_/g, " ");
  if (s.includes("out") || s.includes("reject")) return REMARK_OUT;
  if (s.includes("in")) return REMARK_IN;
  return "";
};

const normalizePartDetail = (detail, requestStatus) => {
  const requestedQty = toInt(detail.requestedQuantity);
  const approvedQty = toInt(detail.approvedQuantity);

  //LUÔN DÙNG DATA TỪ BE VÀ ĐẢM BẢO CONSISTENCY
  const remark = approvedQty > 0 ? REMARK_IN : REMARK_OUT;

  return {
    ...detail,
    partCode: detail.partCode || "-",
    partName: detail.partName || detail.partCode || "-",
    requestedQuantity: requestedQty,
    approvedQuantity: approvedQty,
    remark: remark,
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
const PartRequestTable = ({ requests, loading, error, onView }) => {
  const formatDate = (arr) => {
    if (!Array.isArray(arr)) return "-";
    const [y, m, d, hh, mm] = arr;
    return `${d.toString().padStart(2, "0")}/${m
      .toString()
      .padStart(2, "0")}/${y} ${hh}:${mm}`;
  };

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

  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-blue-50 border-b border-gray-200">
          <tr>
            <th className="py-3 px-4 text-left font-semibold">ID</th>
            <th className="py-3 px-4 text-left font-semibold">
              Service Center
            </th>
            <th className="py-3 px-4 text-left font-semibold">Created By</th>
            <th className="py-3 px-4 text-left font-semibold">Created Date</th>
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
              <td className="py-3 px-4 font-medium">{r.id}</td>
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
    </div>
  );
};

/* ================== VIEW MODAL ================== */
const ViewPartRequestModal = ({ request, onClose }) => {
  if (!request) return null;

  const formatDate = (arr) => {
    if (!Array.isArray(arr)) return "-";
    const [y, m, d, hh, mm] = arr;
    return `${d.toString().padStart(2, "0")}/${m
      .toString()
      .padStart(2, "0")}/${y} ${hh}:${mm}`;
  };

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
              className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                request.status === "PENDING"
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
        requestedQuantity: parseInt(r.quantity),
      };
    });

    const payload = { note, details };
    try {
      setLoading(true);
      const res = await createPartRequestApi(payload);
      if (res?.status === 200 || res?.status === 201) {
        setSuccess(" Request created successfully!");
      } else {
        setSuccess(
          "⚠️ Backend returned non-200, but request may have succeeded."
        );
      }
      onCreated && onCreated();
      setTimeout(() => onClose(), 800);
    } catch (err) {
      console.error("❌ Error creating part request:", err);
      if (err.response?.status === 500) {
        setSuccess(
          "⚠️ Backend returned 500, but request was likely created successfully."
        );
        onCreated && onCreated();
        setTimeout(() => onClose(), 1000);
      } else {
        setError("Failed to create request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 border border-gray-100 animate-slideUp scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          New Part Request
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Requested Parts
            </label>

            {rows.map((row, idx) => {
              const filtered = parts.filter(
                (p) => p.partCategory === row.category
              );
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 mb-3 flex-wrap"
                >
                  <select
                    value={row.category}
                    onChange={(e) =>
                      handleChange(idx, "category", e.target.value)
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={row.partId}
                    onChange={(e) =>
                      handleChange(idx, "partId", e.target.value)
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
                    disabled={!row.category}
                  >
                    <option value="">Select Part</option>
                    {filtered.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Quantity"
                    value={row.quantity}
                    onChange={(e) =>
                      handleChange(idx, "quantity", e.target.value)
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28"
                  />

                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() =>
                setRows([...rows, { category: "", partId: "", quantity: "" }])
              }
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <PlusCircle size={16} /> Add Part
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Note <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter reason or issue..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 p-2 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Submitting..." : "Create Request"}
            </button>
          </div>
        </form>
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

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await getAllPartRequestsApi();
      let data = res.data?.data?.partSupplies || [];
      setRequests(data);
    } catch (err) {
      console.error("❌ Error fetching requests:", err);
      setError("Failed to fetch part requests!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  //  Chuẩn hoá detail theo status tổng
  const handleViewRequest = async (req) => {
    try {
      const res = await getPartRequestDetailApi(req.id);
      const rawData = res.data?.data || req;

      // Chuẩn hoá toàn bộ data
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
      console.error("❌ Error fetching request details:", err);

      const normalizedData = {
        ...req,
        details: [],
      };
      setSelectedRequest(normalizedData);
    }
  };

  const filteredRequests = requests.filter((r) => {
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
        requests={filteredRequests}
        loading={loading}
        error={error}
        onView={handleViewRequest}
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
          onCreated={fetchRequests}
        />
      )}
    </div>
  );
};

export default PartRequestManagement;
