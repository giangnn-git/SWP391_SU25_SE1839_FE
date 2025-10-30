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
  AlertTriangle,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getAllPartRequestsApi,
  getPartRequestDetailApi,
  reviewPartSupplyApi,
} from "../services/api.service";

// === Remark constants & helpers ===
const REMARK_IN = "In stock";
const REMARK_OUT = "Out of stock";

const normalizeReviewDetail = (detail, requestStatus) => {
  const requestedQty = Number(detail?.requestedQuantity ?? 0);
  const approvedQty = Number(detail?.approvedQuantity ?? 0);

  //  LUÔN DÙNG DATA TỪ BE VÀ ĐẢM BẢO CONSISTENCY
  const remark = approvedQty > 0 ? REMARK_IN : REMARK_OUT;

  return {
    ...detail,
    id: detail?.id,
    partCode: detail?.partCode || "-",
    partName: detail?.partName || detail?.partCode || "-",
    requestedQuantity: requestedQty,
    approvedQuantity: approvedQty,
    remark: remark,
  };
};

//  VALIDATION HELPER
const validatePartDetails = (details) => {
  const errors = [];
  const hasErrors = details.some((d) => {
    const approvedQty = Number(d.approvedQuantity ?? 0);
    return (
      (approvedQty === 0 && d.remark === REMARK_IN) ||
      (approvedQty > 0 && d.remark === REMARK_OUT)
    );
  });

  return {
    isValid: !hasErrors,
    message: hasErrors
      ? "Please ensure approved quantity matches remark (In stock = quantity > 0, Out of stock = quantity = 0)"
      : "",
  };
};

//  COMPONENT TOAST MESSAGE
const ToastMessage = ({ type, message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      bg: "bg-green-50 border-green-200",
      text: "text-green-800",
      icon: <CheckCircle2 size={20} className="text-green-600" />,
      title: "Success",
    },
    error: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-800",
      icon: <XCircle size={20} className="text-red-600" />,
      title: "Error",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-800",
      icon: <AlertTriangle size={20} className="text-yellow-600" />,
      title: "Warning",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-800",
      icon: <Info size={20} className="text-blue-600" />,
      title: "Info",
    },
  };

  const { bg, text, icon, title } = config[type] || config.info;

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-6 right-6 ${bg} border ${text} rounded-xl shadow-lg p-4 min-w-80 max-w-md animate-slideInRight z-[1000]`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const PartRequestReview = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  // ✅ THÊM PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const showMessage = (message, type = "info") => {
    setActionMessage(message);
    setMessageType(type);
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setActionMessage("");

      const res = await getAllPartRequestsApi();
      let data = res.data;

      if (data?.data?.partSupplies && Array.isArray(data.data.partSupplies)) {
        const requestsData = data.data.partSupplies.map((item) => ({
          id: item.id,
          partName: "View Details",
          quantity: "Multiple",
          reason: item.note || "-",
          status:
            item.status === "PENDING"
              ? "Pending"
              : item.status === "APPROVED"
              ? "Approved"
              : "Rejected",
          date: formatDate(item.createdDate),
          requester: item.serviceCenterName || "Unknown",
          createdBy: item.createdBy,
          originalData: item,
        }));

        setRequests(requestsData);
      } else {
        setRequests([]);
        showMessage("No part requests data found", "info");
      }
    } catch (err) {
      setRequests([]);
      showMessage(
        err.response?.data?.errorCode ||
          err.response?.data?.message ||
          "Failed to load part requests. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleViewDetail = async (id) => {
    setSelectedRequest({ id, loading: true });
    setDetailLoading(true);
    try {
      const res = await getPartRequestDetailApi(id);
      const data = res.data?.data || {};

      const normalizedDetails = (data.details || []).map((detail) =>
        normalizeReviewDetail(detail, data.status)
      );

      setSelectedRequest({
        ...data,
        details: normalizedDetails,
        status: data.status || "PENDING",
      });
    } catch (err) {
      setSelectedRequest({
        id,
        error: "Failed to load details. Please try again.",
      });
      showMessage("Failed to load request details. Please try again.", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDecision = (id, decision) => {
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

  const handleConfirmAction = async () => {
    if (!confirmId || !selectedRequest) return;

    const validation = validatePartDetails(selectedRequest.details || []);
    if (!validation.isValid) {
      showMessage(validation.message, "error");
      return;
    }

    setProcessing(true);

    try {
      const payload = {
        partSupplyId: selectedRequest.id,
        action: confirmAction === "Approved" ? "APPROVE" : "REJECT",
        note:
          confirmAction === "Approved"
            ? "Approved after checking stock availability"
            : "Rejected due to insufficient stock",
        details: (selectedRequest.details || []).map((d) => ({
          detailId: d.id,
          approvedQuantity: Number(d.approvedQuantity ?? 0),
          remark: d.remark,
        })),
      };

      const res = await reviewPartSupplyApi(payload);

      const responseData = res.data?.data;
      if (responseData) {
        const normalizedDetails = (responseData.details || []).map((detail) => {
          const approvedQty = Number(detail.approvedQuantity ?? 0);
          return {
            ...detail,
            approvedQuantity: approvedQty,
            remark: approvedQty > 0 ? REMARK_IN : REMARK_OUT,
          };
        });

        setSelectedRequest({
          ...responseData,
          details: normalizedDetails,
        });

        // THÊM REQUEST MỚI VÀO ĐẦU LIST
        setRequests((prev) => {
          // Tạo request mới với data cập nhật
          const updatedRequest = {
            id: responseData.id,
            partName: "View Details",
            quantity: "Multiple",
            reason: responseData.note || "-",
            status: confirmAction,
            date: formatDate(responseData.createdDate),
            requester: responseData.serviceCenterName || "Unknown",
            createdBy: responseData.createdBy,
            originalData: responseData,
          };

          const filteredPrev = prev.filter((r) => r.id !== selectedRequest.id);
          return [updatedRequest, ...filteredPrev];
        });
      }

      showMessage(
        confirmAction === "Approved"
          ? "Request approved successfully!"
          : "Request rejected successfully!",
        "success"
      );

      setShowConfirm(false);
    } catch (err) {
      showMessage(
        err.response?.data?.errorCode ||
          err.response?.data?.message ||
          "Failed to update request. Please try again.",
        "error"
      );
    } finally {
      setProcessing(false);
    }
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

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "All" ? true : req.status === filter;
    return matchesSearch && matchesFilter;
  });

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // RESET PAGE KHI FILTER/SEARCH THAY ĐỔI
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const getStatusBadge = (status) => {
    const base =
      "inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border min-w-[90px] text-center";
    switch (status) {
      case "Approved":
      case "APPROVED":
        return (
          <span
            className={`${base} bg-green-50 text-green-700 border-green-200`}
          >
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case "Rejected":
      case "REJECTED":
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

  const hasValidationErrors =
    selectedRequest &&
    Array.isArray(selectedRequest.details) &&
    !validatePartDetails(selectedRequest.details).isValid;

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

      {/* TOAST MESSAGE */}
      {actionMessage && (
        <ToastMessage
          type={messageType}
          message={actionMessage}
          onClose={() => setActionMessage("")}
        />
      )}

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
        ) : currentRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 italic">
            No part requests found.
          </div>
        ) : (
          <>
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-emerald-50 text-gray-800">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">
                    Service Center
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">Reason</th>
                  <th className="py-3 px-4 text-left font-semibold">Date</th>
                  <th className="py-3 px-4 text-center font-semibold">
                    Status
                  </th>
                  <th className="py-3 px-4 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-t border-gray-100 hover:bg-emerald-50/40"
                  >
                    <td className="py-3 px-4 font-medium">{req.requester}</td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      {req.reason}
                    </td>
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

            {/*  PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold">{startIndex + 1}</span>-
                  <span className="font-semibold">
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredRequests.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {filteredRequests.length}
                  </span>{" "}
                  requests
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-emerald-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-h-[90vh] overflow-y-auto p-6 relative border border-gray-100 animate-slideUp">
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
              <div className="space-y-4 text-sm text-gray-700">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="font-medium text-gray-800">
                      Service Center:
                    </label>
                    <div className="mt-1">
                      {selectedRequest.serviceCenterName || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-800">
                      Created By:
                    </label>
                    <div className="mt-1">
                      {selectedRequest.createdBy || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-800">Note:</label>
                    <div className="mt-1 bg-gray-50 p-2 rounded-lg border">
                      {selectedRequest.note || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-800">
                      Created Date:
                    </label>
                    <div className="mt-1">
                      {formatDate(selectedRequest.createdDate)}
                    </div>
                  </div>
                </div>

                {/* RENDER DETAILS VỚI EDIT FUNCTIONALITY */}
                {selectedRequest &&
                  Array.isArray(selectedRequest.details) &&
                  selectedRequest.details.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Parts Requested:
                      </h3>
                      <div className="space-y-3">
                        {selectedRequest.details.map((d, i) => {
                          const isPending =
                            selectedRequest.status === "PENDING";

                          return (
                            <div
                              key={i}
                              className="p-4 border border-gray-200 rounded-xl bg-gray-50/50"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-gray-900">
                                  {d.partName}
                                </span>
                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                                  #{i + 1}
                                </span>
                              </div>

                              {isPending ? (
                                <>
                                  <div className="mt-2 flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                      Requested: {d.requestedQuantity}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Approved Qty
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max={d.requestedQuantity}
                                        value={d.approvedQuantity}
                                        onChange={(e) => {
                                          const newQuantity = Number(
                                            e.target.value
                                          );
                                          const updatedDetails = [
                                            ...selectedRequest.details,
                                          ];
                                          updatedDetails[i] = {
                                            ...updatedDetails[i],
                                            approvedQuantity: newQuantity,
                                            remark:
                                              newQuantity > 0
                                                ? REMARK_IN
                                                : REMARK_OUT,
                                          };
                                          setSelectedRequest((prev) => ({
                                            ...prev,
                                            details: updatedDetails,
                                          }));
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Remark
                                      </label>
                                      <select
                                        value={d.remark}
                                        onChange={(e) => {
                                          const newRemark = e.target.value;
                                          const updatedDetails = [
                                            ...selectedRequest.details,
                                          ];
                                          updatedDetails[i] = {
                                            ...updatedDetails[i],
                                            remark: newRemark,
                                            approvedQuantity:
                                              newRemark === REMARK_IN
                                                ? Math.max(
                                                    1,
                                                    d.approvedQuantity || 1
                                                  )
                                                : 0,
                                          };
                                          setSelectedRequest((prev) => ({
                                            ...prev,
                                            details: updatedDetails,
                                          }));
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                      >
                                        <option value={REMARK_IN}>
                                          In stock
                                        </option>
                                        <option value={REMARK_OUT}>
                                          Out of stock
                                        </option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* VALIDATION MESSAGES */}
                                  {d.approvedQuantity === 0 &&
                                    d.remark === REMARK_IN && (
                                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                        <XCircle size={12} />
                                        In stock requires approved quantity
                                        greater than 0
                                      </p>
                                    )}
                                  {d.approvedQuantity > 0 &&
                                    d.remark === REMARK_OUT && (
                                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                        <XCircle size={12} />
                                        Out of stock requires approved quantity
                                        = 0
                                      </p>
                                    )}
                                </>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                      Requested:
                                    </span>
                                    <span className="font-medium">
                                      {d.requestedQuantity}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                      Approved:
                                    </span>
                                    <span className="font-semibold text-emerald-600">
                                      {d.approvedQuantity}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                      Remark:
                                    </span>
                                    <span
                                      className={`font-semibold ${
                                        d.remark === REMARK_IN
                                          ? "text-emerald-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {d.remark}
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

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                Close
              </button>

              {selectedRequest.status === "PENDING" && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleDecision(selectedRequest.id, "Approved")
                    }
                    disabled={processing || hasValidationErrors}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    {processing ? "Processing..." : "Approve"}
                  </button>

                  <button
                    onClick={() =>
                      handleDecision(selectedRequest.id, "Rejected")
                    }
                    disabled={processing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
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

      {/* Modal xác nhận hành động */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 text-center animate-slideUp">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              {confirmAction === "Approved" ? (
                <CheckCircle2 className="text-emerald-600" size={24} />
              ) : (
                <XCircle className="text-red-600" size={24} />
              )}
            </div>
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
                disabled={processing}
                className={`px-5 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 ${
                  confirmAction === "Approved"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50`}
              >
                {processing ? "Processing..." : "Confirm"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={processing}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartRequestReview;
