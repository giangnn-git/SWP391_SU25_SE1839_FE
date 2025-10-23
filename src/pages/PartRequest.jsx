import React, { useState, useEffect } from "react";
import {
  PackageSearch,
  Send,
  ClipboardList,
  X,
  CheckCircle2,
  Clock4,
  AlertCircle,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import axios from "axios";
import {
  createPartRequestApi,
  getAllPartRequestsApi,
} from "../services/api.service";

const PartRequestPage = () => {
  const [items, setItems] = useState([
    { partCode: "", quantity: "" }, // initial one row
  ]);
  const [note, setNote] = useState("");
  const [requests, setRequests] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const res = await getAllPartRequestsApi();
      let data = res.data;
      if (Array.isArray(data?.data?.partSupplies))
        data = data.data.partSupplies;
      else if (Array.isArray(data)) data = data;
      else data = [];
      setRequests(data);
    } catch (err) {
      console.error("Error fetching part requests:", err);
      setError("Failed to load part requests. Please try again later.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { partCode: "", quantity: "" }]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const validateItems = () => {
    if (items.length === 0) {
      setError("Please add at least one part to request.");
      return false;
    }
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.partCode) {
        setError(`Part code is required on row ${i + 1}.`);
        return false;
      }
      if (!it.quantity) {
        setError(`Quantity is required on row ${i + 1}.`);
        return false;
      }
      const q = Number(it.quantity);
      if (!Number.isInteger(q) || q <= 0) {
        setError(`Quantity must be a positive integer on row ${i + 1}.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateItems()) return;

    const details = items.map((it) => ({
      partCode: String(it.partCode),
      requestedQuantity: Number(it.quantity),
    }));

    const payload = {
      note: note || "",
      details,
    };

    try {
      setLoading(true);
      await createPartRequestApi(payload);
      setSuccess("Request submitted successfully!");
      setItems([{ partCode: "", quantity: "" }]);
      setNote("");
      await fetchRequests();
    } catch (err) {
      console.error("Error creating part request:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to submit request. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const formatDate = (dateArray) => {
    if (!Array.isArray(dateArray)) return "-";
    const [y, m, d, hh, mm] = dateArray;
    return `${d.toString().padStart(2, "0")}/${m
      .toString()
      .padStart(2, "0")}/${y} ${hh}:${mm}`;
  };

  const StatusBadge = ({ status }) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
            <Clock4 size={12} /> Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium">
            <X size={12} /> Rejected
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-2xl shadow-sm">
          <PackageSearch size={28} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Claim Parts (multiple items)
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Submit multiple replacement parts in a single claim to the EVM team.
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 animate-fadeIn">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 animate-fadeIn">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white/90 border border-gray-200 rounded-2xl shadow-md p-6 mb-10 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-2 mb-5">
          <ClipboardList size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">New Claim</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Part Code
                  </label>
                  <input
                    type="text"
                    placeholder="Part code"
                    value={it.partCode}
                    onChange={(e) =>
                      handleItemChange(idx, "partCode", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={it.quantity}
                    onChange={(e) =>
                      handleItemChange(idx, "quantity", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="col-span-3 flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 text-sm"
                    disabled={items.length === 1}
                    title="Remove row"
                  >
                    <Minus size={14} /> Remove
                  </button>

                  {idx === items.length - 1 && (
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 text-sm"
                      title="Add new row"
                    >
                      <Plus size={14} /> Add
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              placeholder="Describe the issue or reason..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white transition-all duration-300 shadow-md ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send size={16} /> Send Claim
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/90 border border-gray-200 rounded-2xl shadow-md p-6 transition-all duration-300">
        <div className="flex items-center gap-2 mb-5">
          <Clock4 size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            My Request History
          </h2>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500 italic">
            No requests submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700 border-collapse">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">ID</th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Service Center
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Created By
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">Date</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                  <th className="py-3 px-4 text-left font-semibold">Note</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-gray-100 hover:bg-blue-50/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{req.id}</td>
                    <td className="py-3 px-4">{req.serviceCenterName}</td>
                    <td className="py-3 px-4">{req.createdBy}</td>
                    <td className="py-3 px-4">{formatDate(req.createdDate)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-700">{req.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartRequestPage;
