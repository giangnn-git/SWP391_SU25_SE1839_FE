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
} from "lucide-react";
import axios from "axios";
import {
    createPartRequestApi,
    getAllPartRequestsApi,
} from "../services/api.service";

const PartRequestPage = () => {
    const [formData, setFormData] = useState({
        partId: "",
        quantity: "",
        note: "",
    });
    const [requests, setRequests] = useState([]);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ Fetch tất cả yêu cầu từ BE
    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            if (token)
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const res = await getAllPartRequestsApi();
            let data = res.data;

            // Chuẩn hóa dữ liệu (theo đúng JSON bạn gửi)
            if (Array.isArray(data?.data?.partSupplies))
                data = data.data.partSupplies;
            else if (Array.isArray(data)) data = data;
            else data = [];

            console.log("✅ Normalized part requests:", data);
            setRequests(data);
        } catch (err) {
            console.error("❌ Error fetching part requests:", err);
            setError("Failed to load part requests. Please try again later.");
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // ✅ Gửi yêu cầu mới
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.partId || !formData.quantity || !formData.note) {
            setError("Please fill in all fields before submitting.");
            return;
        }

        const payload = {
            note: formData.note,
            details: [
                {
                    partId: parseInt(formData.partId),
                    requestedQuantity: parseInt(formData.quantity),
                },
            ],
        };

        try {
            setLoading(true);
            await createPartRequestApi(payload);
            setSuccess("✅ Request submitted successfully!");
            setFormData({ partId: "", quantity: "", note: "" });
            await fetchRequests(); // Reload list sau khi tạo
        } catch (err) {
            console.error("❌ Error creating part request:", err);
            setError("Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(""), 3000);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // ✅ Format ngày từ mảng [year,month,day,hour,minute,...]
    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray)) return "-";
        const [y, m, d, hh, mm] = dateArray;
        return `${d.toString().padStart(2, "0")}/${m
            .toString()
            .padStart(2, "0")}/${y} ${hh}:${mm}`;
    };

    return (
        <div className="p-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 rounded-2xl shadow-sm">
                    <PackageSearch size={28} className="text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Request Parts from Manufacturer
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Submit a replacement part request directly to the EVM team.
                    </p>
                </div>
            </div>

            {/* Alerts */}
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

            {/* Form */}
            <div className="bg-white/90 border border-gray-200 rounded-2xl shadow-md p-6 mb-10 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-5">
                    <ClipboardList size={20} className="text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-800">
                        New Part Request
                    </h2>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-3 gap-5"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Part ID
                        </label>
                        <input
                            type="number"
                            placeholder="Enter part ID"
                            value={formData.partId}
                            onChange={(e) => handleInputChange("partId", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                        </label>
                        <input
                            type="number"
                            min="1"
                            placeholder="Enter quantity"
                            value={formData.quantity}
                            onChange={(e) => handleInputChange("quantity", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Note
                        </label>
                        <input
                            type="text"
                            placeholder="Describe the issue or reason..."
                            value={formData.note}
                            onChange={(e) => handleInputChange("note", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white transition-all duration-300 shadow-md ${loading
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
                                    <Send size={16} /> Send Request
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Request Table */}
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
                                    <th className="py-3 px-4 text-left font-semibold">Service Center</th>
                                    <th className="py-3 px-4 text-left font-semibold">Created By</th>
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
                                            {req.status === "PENDING" && (
                                                <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
                                                    <Clock4 size={12} /> Pending
                                                </span>
                                            )}
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
