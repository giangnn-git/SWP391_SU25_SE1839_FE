import React, { useEffect, useState } from "react";
import {
  PackageSearch,
  CheckCircle2,
  XCircle,
  Clock4,
  Search,
  Eye,
  Loader2,
  Filter,
  Edit3,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import {
  getAllPartRequestsApi,
  getPartRequestDetailApi,
  reviewPartSupplyApi,
} from "../services/api.service";

const PartRequestReview = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // State cho quantity editing
  const [editingQuantities, setEditingQuantities] = useState({});
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);

  // Lấy danh sách yêu cầu phụ tùng
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const res = await getAllPartRequestsApi();
      let data = res.data;

      if (Array.isArray(data?.data?.partSupplies)) {
        data = data.data.partSupplies;
      } else if (Array.isArray(data)) {
        data = data;
      } else {
        data = [];
      }

      const mapped = data.map((item) => ({
        id: item.id,
        partName: item.note?.split(" ")[1] || "N/A",
        quantity: item.details?.[0]?.requestedQuantity || "-",
        reason: item.note || "-",
        status:
          item.status === "PENDING"
            ? "Pending"
            : item.status === "APPROVED"
            ? "Approved"
            : "Rejected",
        date: formatDate(item.createdDate),
        requester: item.serviceCenterName || "Unknown",
      }));

      setRequests(mapped);
    } catch (err) {
      console.error("❌ Error fetching part requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Lấy chi tiết 1 yêu cầu - ĐÃ SỬA: Thêm debug log
  const handleViewDetail = async (id) => {
    setSelectedRequest({ id, loading: true });
    setDetailLoading(true);

    try {
      const res = await getPartRequestDetailApi(id);
      const data = res.data?.data || {};

      // 🔥 DEBUG: Log toàn bộ response để xem có partCode không
      console.log("📋 Full detail response:", data);
      console.log("🔍 Details array:", data.details);

      // Khởi tạo editing quantities
      const initialQuantities = {};
      if (data.details && Array.isArray(data.details)) {
        data.details.forEach((detail) => {
          console.log("📦 Detail item:", detail); // Debug từng detail
          initialQuantities[detail.id] = detail.requestedQuantity || 0;
        });
      }
      setEditingQuantities(initialQuantities);

      setSelectedRequest(data);
    } catch (err) {
      console.error("❌ Error fetching part request detail:", err);
      setSelectedRequest({
        id,
        error: "Failed to load details. Please try again.",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (detailId, newQuantity) => {
    setEditingQuantities((prev) => ({
      ...prev,
      [detailId]: Math.max(0, parseInt(newQuantity) || 0),
    }));
  };

  // Hàm xử lý approve/reject với API - ĐÃ SỬA: Thêm debug
  const handleDecision = async (action) => {
    if (!selectedRequest) return;

    console.log("🎯 Handling decision:", action);
    console.log("📝 Selected request:", selectedRequest);

    setApproveLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      // Chuẩn bị data theo format API yêu cầu
      const reviewData = {
        partSupplyId: selectedRequest.id,
        action: action.toUpperCase(),
        note:
          action === "APPROVE"
            ? "Approved after quantity adjustment"
            : "Rejected due to insufficient stock",
        details:
          selectedRequest.details?.map((detail) => ({
            detailId: detail.id,
            approvedQuantity:
              action === "APPROVE" ? editingQuantities[detail.id] || 0 : 0,
            remark:
              action === "APPROVE"
                ? `Approved ${editingQuantities[detail.id]} out of ${
                    detail.requestedQuantity
                  } requested`
                : "Rejected - Out of stock",
          })) || [],
      };

      console.log("📤 Final review data:", reviewData);

      // Gọi API
      const response = await reviewPartSupplyApi(reviewData);
      console.log("✅ API Response:", response.data);

      // Kiểm tra response
      if (response.data && response.data.status === "200 OK") {
        // Cập nhật UI
        setRequests((prev) =>
          prev.map((req) =>
            req.id === selectedRequest.id
              ? {
                  ...req,
                  status: action === "APPROVE" ? "Approved" : "Rejected",
                }
              : req
          )
        );

        setSelectedRequest((prev) => ({
          ...prev,
          status: action.toUpperCase(),
        }));

        setActionMessage(
          action === "APPROVE"
            ? "✅ Request approved successfully!"
            : "❌ Request rejected successfully!"
        );

        // Đóng modal quantity nếu đang mở
        setShowQuantityModal(false);

        // Refresh danh sách sau 1 giây
        setTimeout(() => {
          fetchRequests();
        }, 1000);
      } else {
        throw new Error(response.data?.message || "Unknown error");
      }
    } catch (err) {
      console.error("❌ Error updating request:", err);
      console.error("❌ Error details:", err.response?.data);

      // HIỂN THỊ ERROR CHI TIẾT
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update request status";
      setActionMessage(`❌ ${errorMessage}`);
    } finally {
      setApproveLoading(false);
      setTimeout(() => setActionMessage(""), 5000);
    }
  };

  // 🔥 NEW: Hàm xử lý mở modal Adjust & Approve
  const handleAdjustAndApprove = () => {
    console.log("🔄 Opening adjust modal for request:", selectedRequest?.id);
    setShowQuantityModal(true);
  };

  // Modal điều chỉnh quantity - ĐÃ SỬA: Thêm part code/name display
  const renderQuantityModal = () => {
    if (!selectedRequest || !showQuantityModal) return null;

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 relative border border-gray-100 animate-slideUp">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Edit3 size={20} className="text-blue-600" />
              Adjust Quantities
            </h2>
            <button
              onClick={() => setShowQuantityModal(false)}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              disabled={approveLoading}
            >
              <XCircle size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Adjust approved quantities for each part:
            </p>

            {selectedRequest.details?.map((detail, index) => (
              <div
                key={detail.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  {/* 🔥 HIỂN THỊ PART CODE/NAME - Sử dụng partCode nếu có, không thì dùng partId */}
                  <p className="text-sm font-medium text-gray-900">
                    Part: {detail.partCode || `ID: ${detail.partId}`}
                  </p>
                  <p className="text-xs text-gray-600">
                    Requested: {detail.requestedQuantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={detail.requestedQuantity}
                    value={editingQuantities[detail.id] || 0}
                    onChange={(e) =>
                      handleQuantityChange(detail.id, e.target.value)
                    }
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    disabled={approveLoading}
                  />
                  <span className="text-xs text-gray-500">
                    / {detail.requestedQuantity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowQuantityModal(false)}
              disabled={approveLoading}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDecision("APPROVE")}
              disabled={approveLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approveLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Confirm Approval
                </>
              )}
            </button>
          </div>

          {/* Loading indicator */}
          {approveLoading && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Processing your request...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const formatDate = (arr) => {
    if (!Array.isArray(arr)) return "-";
    const [y, m, d, hh, mm] = arr;
    return `${d.toString().padStart(2, "0")}/${m
      .toString()
      .padStart(2, "0")}/${y} ${hh}:${mm}`;
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "All" ? true : req.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const base =
      "inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border min-w-[90px] text-center";
    switch (status) {
      case "APPROVED":
      case "Approved":
        return (
          <span
            className={`${base} bg-green-50 text-green-700 border-green-200`}
          >
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case "REJECTED":
      case "Rejected":
        return (
          <span className={`${base} bg-red-50 text-red-700 border-red-200`}>
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span
            className={`${base} bg-yellow-50 text-yellow-700 border-yellow-200`}
          >
            <Clock4 size={12} /> Pending
          </span>
        );
    }
  };

  const totalApproved = requests.filter((r) => r.status === "Approved").length;
  const totalPending = requests.filter((r) => r.status === "Pending").length;
  const totalRejected = requests.filter((r) => r.status === "Rejected").length;

  return (
    <div className="p-8 animate-fadeIn bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-2xl shadow-lg text-white">
            <PackageSearch size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Part Request Review
            </h1>
            <p className="text-gray-600 text-sm">
              Review and approve part requests submitted by Service Centers.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/90 rounded-lg text-white">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800">
                Approved Requests
              </h3>
              <p className="text-2xl font-bold text-green-700">
                {totalApproved}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/90 rounded-lg text-white">
              <Clock4 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800">
                Pending Requests
              </h3>
              <p className="text-2xl font-bold text-yellow-700">
                {totalPending}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/90 rounded-lg text-white">
              <XCircle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800">
                Rejected Requests
              </h3>
              <p className="text-2xl font-bold text-red-700">{totalRejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="All">All Requests</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by part or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <Loader2 className="mx-auto animate-spin mb-2" /> Loading
            requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 italic">
            No part requests found.
          </div>
        ) : (
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-emerald-50 text-gray-800">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Part</th>
                <th className="py-3 px-4 text-left font-semibold">Quantity</th>
                <th className="py-3 px-4 text-left font-semibold">Reason</th>
                <th className="py-3 px-4 text-left font-semibold">Requester</th>
                <th className="py-3 px-4 text-left font-semibold">Date</th>
                <th className="py-3 px-4 text-center font-semibold">Status</th>
                <th className="py-3 px-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="border-t border-gray-100 hover:bg-emerald-50/40"
                >
                  <td className="py-3 px-4 font-medium">{req.partName}</td>
                  <td className="py-3 px-4">{req.quantity}</td>
                  <td className="py-3 px-4">{req.reason}</td>
                  <td className="py-3 px-4">{req.requester}</td>
                  <td className="py-3 px-4">{req.date}</td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleViewDetail(req.id)}
                      className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 border border-emerald-300 rounded hover:bg-emerald-600 hover:text-white transition flex items-center gap-1"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal chi tiết - ĐÃ SỬA: Hiển thị part code/name */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] p-6 relative border border-gray-100 animate-slideUp">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Eye size={20} className="text-emerald-600" />
                Request Details
              </h2>
              {getStatusBadge(selectedRequest.status)}
            </div>

            {detailLoading ? (
              <div className="text-center py-6 text-gray-500">
                <Loader2 className="mx-auto animate-spin mb-2" /> Loading...
              </div>
            ) : (
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <b>Service Center:</b>{" "}
                  {selectedRequest.serviceCenterName || "-"}
                </p>
                <p>
                  <b>Created By:</b> {selectedRequest.createdBy || "-"}
                </p>
                <p>
                  <b>Note:</b> {selectedRequest.note || "-"}
                </p>
                <p>
                  <b>Created Date:</b> {formatDate(selectedRequest.createdDate)}
                </p>

                {Array.isArray(selectedRequest.details) &&
                  selectedRequest.details.length > 0 && (
                    <div className="mt-3 border-t border-gray-200 pt-2">
                      <b>Parts Requested:</b>
                      <ul className="ml-4 mt-2 space-y-2">
                        {selectedRequest.details.map((d, i) => (
                          <li
                            key={i}
                            className="flex justify-between items-center bg-gray-50 p-2 rounded"
                          >
                            {/* 🔥 HIỂN THỊ PART CODE/NAME - Sử dụng partCode nếu có, không thì dùng partId */}
                            <span>Part: {d.partCode || `ID: ${d.partId}`}</span>
                            <span className="font-medium">
                              Quantity: {d.requestedQuantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {/* Footer với chức năng mới  */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                Close
              </button>

              {selectedRequest.status === "PENDING" && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAdjustAndApprove}
                    disabled={processing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Edit3 size={16} />
                    Adjust & Approve
                  </button>

                  <button
                    onClick={() => handleDecision("REJECT")}
                    disabled={processing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <XCircle size={16} />
                    {processing ? "Processing..." : "Reject"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quantity Adjustment Modal */}
      {renderQuantityModal()}

      {/* Toast */}
      {actionMessage && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fadeIn flex items-center gap-2 ${
            actionMessage.includes("✅")
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {actionMessage.includes("✅") ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {actionMessage.replace("✅", "").replace("❌", "")}
        </div>
      )}
    </div>
  );
};

export default PartRequestReview;
