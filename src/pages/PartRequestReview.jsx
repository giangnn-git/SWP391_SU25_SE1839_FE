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
} from "lucide-react";
import axios from "axios";
import {
  getAllPartRequestsApi,
  getPartRequestDetailApi,
  reviewPartSupplyApi,
} from "../services/api.service";

// === Remark constants & helpers ===
const REMARK_IN = "In stock";
const REMARK_OUT = "Out of stock";

const normalizeRemark = (r) => {
  if (!r) return "";
  const s = String(r).trim().toLowerCase().replace(/_/g, " ");
  if (s.includes("out")) return REMARK_OUT;
  if (s.includes("in")) return REMARK_IN;
  return "";
};

// Luôn suy ra remark hợp lệ để hiển thị (dù BE trả null/format khác)
const resolveRemark = (d) => {
  const normalized = normalizeRemark(d?.remark);
  if (normalized) return normalized;
  const qty = Number(d?.approvedQuantity ?? d?.requestedQuantity ?? 0);
  return qty > 0 ? REMARK_IN : REMARK_OUT;
};

const PartRequestReview = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // ✅ Modal xác nhận
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  // ✅ Lấy danh sách yêu cầu phụ tùng
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

      // 🔥 Lấy chi tiết từng request
      const detailedList = await Promise.all(
        data.map(async (item) => {
          try {
            const detailRes = await getPartRequestDetailApi(item.id);
            const details = detailRes.data?.data?.details || [];
            const firstDetail = details[0] || {};

            return {
              id: item.id,
              partName: firstDetail.partCode || "—",
              quantity: firstDetail.requestedQuantity || "—",
              reason: item.note || "-",
              status:
                item.status === "PENDING"
                  ? "Pending"
                  : item.status === "APPROVED"
                    ? "Approved"
                    : "Rejected",
              date: formatDate(item.createdDate),
              requester: item.serviceCenterName || "Unknown",
            };
          } catch {
            return {
              id: item.id,
              partName: "—",
              quantity: "—",
              reason: item.note || "-",
              status:
                item.status === "PENDING"
                  ? "Pending"
                  : item.status === "APPROVED"
                    ? "Approved"
                    : "Rejected",
              date: formatDate(item.createdDate),
              requester: item.serviceCenterName || "Unknown",
            };
          }
        })
      );

      setRequests(detailedList);
    } catch (err) {
      console.error("❌ Error fetching part requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ✅ Xem chi tiết
  const handleViewDetail = async (id) => {
    setSelectedRequest({ id, loading: true });
    setDetailLoading(true);
    try {
      const res = await getPartRequestDetailApi(id);
      const data = res.data?.data || {};
      // chuẩn hoá remark trước khi set vào state
      setSelectedRequest({
        ...data,
        details: (data.details || []).map((d) => ({
          ...d,
          remark: normalizeRemark(d.remark),
        })),
      });
    } catch (err) {
      console.error("❌ Error fetching detail:", err);
      setSelectedRequest({ id, error: "Failed to load details." });
    } finally {
      setDetailLoading(false);
    }
  };

  // ✅ Modal xác nhận hành động
  const handleDecision = (id, decision) => {
    // Nếu là REJECT thì tự động set remark = "Out of stock"
    if (
      decision === "Rejected" &&
      selectedRequest &&
      Array.isArray(selectedRequest.details)
    ) {
      const updatedDetails = selectedRequest.details.map((d) => ({
        ...d,
        remark: REMARK_OUT,
        approvedQuantity: 0,
      }));
      setSelectedRequest((prev) => ({
        ...prev,
        details: updatedDetails,
      }));
    }

    setConfirmId(id);
    setConfirmAction(decision);
    setShowConfirm(true);
  };

  // ✅ Gửi duyệt / từ chối
  const handleConfirmAction = async () => {
    if (!confirmId || !selectedRequest) return;
    setProcessing(true);

    try {
      const payload = {
        partSupplyId: selectedRequest.id,
        action: confirmAction === "Approved" ? "APPROVE" : "REJECT",
        note:
          confirmAction === "Approved"
            ? "Approved after checking stock availability"
            : "Rejected due to insufficient stock",
        details: (selectedRequest.details || []).map((d, i) => ({
          detailId: d.id || d.detailId || i + 1,
          approvedQuantity:
            confirmAction === "Approved"
              ? Number(d.approvedQuantity ?? d.requestedQuantity ?? 0)
              : 0,
          remark:
            d.remark ||
            (confirmAction === "Approved" ? REMARK_IN : REMARK_OUT),
        })),
      };

      console.log("📦 Payload gửi BE:", payload);

      const res = await reviewPartSupplyApi(payload);
      console.log("✅ API Response:", res.data);

      // ✅ Cập nhật ngay trên giao diện (modal)
      setSelectedRequest((prev) => ({
        ...prev,
        status: confirmAction.toUpperCase(),
        note:
          confirmAction === "Approved"
            ? "Approved after checking stock availability"
            : "Rejected due to insufficient stock",
        details: (prev.details || []).map((d) => ({
          ...d,
          approvedQuantity:
            confirmAction === "Approved"
              ? Number(d.approvedQuantity ?? d.requestedQuantity ?? 0)
              : 0,
          remark: confirmAction === "Approved" ? REMARK_IN : REMARK_OUT,
        })),
      }));

      // ✅ Cập nhật ngay trong bảng danh sách
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? {
              ...r,
              status: confirmAction,
              reason:
                confirmAction === "Approved"
                  ? "Approved after checking stock availability"
                  : "Rejected due to insufficient stock",
            }
            : r
        )
      );

      setActionMessage(
        confirmAction === "Approved"
          ? "✅ Request approved successfully!"
          : "❌ Request rejected successfully!"
      );

      setShowConfirm(false);
      setTimeout(() => fetchRequests(), 1000);
    } catch (err) {
      console.error("❌ Error reviewing request:", err);
      console.log("🧾 Response từ BE:", err.response?.data);
      setActionMessage("Failed to update request on server.");
    } finally {
      setProcessing(false);
      setTimeout(() => setActionMessage(""), 3000);
    }
  };

  // ✅ Định dạng ngày
  const formatDate = (arr) => {
    if (!Array.isArray(arr)) return "-";
    const [y, m, d, hh, mm] = arr;
    return `${d.toString().padStart(2, "0")}/${m
      .toString()
      .padStart(2, "0")}/${y} ${hh}:${mm}`;
  };

  // ✅ Lọc theo trạng thái + tìm kiếm
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "All" ? true : req.status === filter;
    return matchesSearch && matchesFilter;
  });

  // ✅ Trạng thái
  const getStatusBadge = (status = "") => {
    const s = status.toUpperCase();
    const base =
      "inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border min-w-[90px] text-center";
    switch (s) {
      case "APPROVED":
        return (
          <span className={`${base} bg-green-50 text-green-700 border-green-200`}>
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className={`${base} bg-red-50 text-red-700 border-red-200`}>
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-200`}>
            <Clock4 size={12} /> Pending
          </span>
        );
    }
  };

  const totalApproved = requests.filter((r) => r.status === "Approved").length;
  const totalPending = requests.filter((r) => r.status === "Pending").length;
  const totalRejected = requests.filter((r) => r.status === "Rejected").length;

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen animate-fadeIn">
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

      {/* KPI */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          {
            title: "Approved Requests",
            count: totalApproved,
            color: "green",
            icon: <CheckCircle2 size={20} />,
          },
          {
            title: "Pending Requests",
            count: totalPending,
            color: "yellow",
            icon: <Clock4 size={20} />,
          },
          {
            title: "Rejected Requests",
            count: totalRejected,
            color: "red",
            icon: <XCircle size={20} />,
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between bg-${card.color}-50 border border-${card.color}-200 rounded-xl p-4`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${card.color}-500/90 rounded-lg text-white`}>
                {card.icon}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800">{card.title}</h3>
                <p className={`text-2xl font-bold text-${card.color}-700`}>
                  {card.count}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
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
            <Loader2 className="mx-auto animate-spin mb-2" /> Loading requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 italic">
            No part requests found.
          </div>
        ) : (
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-emerald-50 text-gray-800">
              <tr>
                <th className="py-3 px-4 text-left">Part</th>
                <th className="py-3 px-4 text-left">Quantity</th>
                <th className="py-3 px-4 text-left">Reason</th>
                <th className="py-3 px-4 text-left">Requester</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
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
                      className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 border border-emerald-300 rounded hover:bg-emerald-600 hover:text-white flex items-center gap-1"
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

      {/* Modal chi tiết */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-[520px] p-6 relative border border-gray-100 animate-slideUp">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Eye size={20} className="text-emerald-600" /> Request Details
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
                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <b className="block mb-2 text-gray-800">
                        Parts Requested:
                      </b>

                      <div className="space-y-3">
                        {selectedRequest.details.map((d, i) => {
                          const remarkUi = resolveRemark(d);
                          const isPending =
                            selectedRequest.status?.toUpperCase() ===
                            "PENDING";

                          return (
                            <div
                              key={i}
                              className="p-3 border rounded-lg bg-gray-50"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800">
                                  {d.partCode || "-"}
                                </span>
                                {/* số thứ tự giống #1, #2 */}
                                <span className="text-xs text-gray-400">
                                  #{i + 1}
                                </span>
                              </div>

                              {/* Nếu PENDING => cho chỉnh; ngược lại => hiển thị như ảnh */}
                              {isPending ? (
                                <>
                                  {/* Approved Quantity (input) */}
                                  <div className="mt-2 flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700 w-32">
                                      Approved Quantity:
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      value={
                                        d.approvedQuantity ??
                                        d.requestedQuantity ??
                                        0
                                      }
                                      onChange={(e) => {
                                        const updated = [
                                          ...selectedRequest.details,
                                        ];
                                        updated[i].approvedQuantity = Number(
                                          e.target.value
                                        );
                                        setSelectedRequest((prev) => ({
                                          ...prev,
                                          details: updated,
                                        }));
                                      }}
                                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-24 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                  </div>

                                  {/* Remark (select) */}
                                  <div className="mt-2 flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700 w-32">
                                      Remark:
                                    </label>
                                    <select
                                      value={remarkUi}
                                      onChange={(e) => {
                                        const updated = [
                                          ...selectedRequest.details,
                                        ];
                                        updated[i].remark = e.target.value;
                                        setSelectedRequest((prev) => ({
                                          ...prev,
                                          details: updated,
                                        }));
                                      }}
                                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm flex-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                    >
                                      <option value={REMARK_IN}>
                                        In stock
                                      </option>
                                      <option value={REMARK_OUT}>
                                        Out of stock
                                      </option>
                                    </select>
                                  </div>

                                  {/* Requested (static) */}
                                  <div className="mt-2 text-sm text-gray-500">
                                    Requested: {d.requestedQuantity}
                                  </div>
                                </>
                              ) : (
                                // === HIỂN THỊ NHƯ ẢNH ===
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                      Requested: {d.requestedQuantity}
                                    </span>
                                    <span className="text-gray-800">
                                      <b>Approved:</b>{" "}
                                      {Number(
                                        d.approvedQuantity ??
                                        d.requestedQuantity ??
                                        0
                                      )}
                                    </span>
                                  </div>
                                  <div className="text-gray-600">
                                    Remark:{" "}
                                    <span
                                      className={`font-semibold ${remarkUi === REMARK_IN
                                        ? "text-emerald-600"
                                        : "text-red-600"
                                        }`}
                                    >
                                      {remarkUi}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>

              {selectedRequest.status?.toUpperCase() === "PENDING" && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleDecision(selectedRequest.id, "Approved")
                    }
                    disabled={processing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-sm"
                  >
                    <CheckCircle2 size={16} />
                    {processing ? "Processing..." : "Approve"}
                  </button>

                  <button
                    onClick={() =>
                      handleDecision(selectedRequest.id, "Rejected")
                    }
                    disabled={processing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium shadow-sm"
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

      {/* ✅ Modal xác nhận hành động */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Confirm Action
            </h3>
            <p className="text-gray-600 text-sm mb-5">
              {confirmAction === "Approved"
                ? "Are you sure you want to approve this request?"
                : "Are you sure you want to reject this request?"}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleConfirmAction}
                className={`px-5 py-2 rounded-lg text-white text-sm ${confirmAction === "Approved"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fadeIn">
          {actionMessage}
        </div>
      )}
    </div>
  );
};

export default PartRequestReview;
