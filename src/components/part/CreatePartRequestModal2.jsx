import { useEffect, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import {
    getAllPartsApi,
    createPartRequestApi,
} from "../../services/api.service";

const CreatePartRequestModal = ({ onClose, onCreated, prefilledPart }) => {
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
                } else {
                    setError("Unexpected response format from server.");
                }
            } catch {
                setError("Failed to load part list.");
            }
        };
        fetchParts();
    }, []);

    // NEW: Pre-fill form when prefilledPart is provided
    useEffect(() => {
        if (prefilledPart && parts.length > 0) {
            setRows([
                {
                    category: prefilledPart.category || "",
                    partId: prefilledPart.partId ? String(prefilledPart.partId) : "",
                    quantity: prefilledPart?.recommendedQuantity || "1", // Default quantity suggestion
                },
            ]);
            setNote(`Request for ${prefilledPart.partName || "part"} - Low/No stock`);
        }
    }, [prefilledPart, parts]);

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

        const payload = { note: note.trim(), details };

        try {
            setLoading(true);
            const res = await createPartRequestApi(payload);

            if (res?.status === 200 || res?.status === 201) {
                setSuccess("Request created successfully! Waiting for approval.");
                onCreated?.();
                setTimeout(() => onClose?.(), 1500);
            } else {
                setError("Unexpected backend response.");
            }
        } catch (err) {
            const status = err?.response?.status;
            const data = err?.response?.data;
            if (
                status === 500 &&
                data?.errorCode?.includes("Failed to convert value")
            ) {
                setError(
                    "Server error: Invalid data format. Please check part selection."
                );
            } else if (status === 400) {
                setError("Bad request. Please check your input.");
            } else {
                setError(`Error ${status || ""}: ${data?.message || "Unknown error"}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <PlusCircle size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">New Part Request</h2>
                            <p className="text-blue-100 text-sm mt-1">
                                {prefilledPart
                                    ? `Request for: ${prefilledPart.partName}`
                                    : "Add parts needed for warranty service"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-lg"
                    >
                        <XIcon />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Info banner for prefilled parts */}
                    {prefilledPart && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 mt-0.5">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-blue-900">Pre-filled Request</h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Part information has been pre-filled. Please review quantity and add note before submitting.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Requested Parts */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <div className="flex justify-between mb-4">
                            <label className="text-lg font-semibold text-gray-800">
                                Requested Parts
                            </label>
                            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-md border">
                                {rows.length} part(s)
                            </span>
                        </div>

                        {rows.map((row, idx) => {
                            const filtered = parts.filter(
                                (p) => p.partCategory === row.category
                            );
                            const isPrefilled = prefilledPart && idx === 0;

                            return (
                                <div
                                    key={idx}
                                    className={`bg-white p-4 rounded-lg border shadow-sm mb-3 ${isPrefilled ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200"
                                        }`}
                                >
                                    {isPrefilled && (
                                        <div className="mb-3 flex items-center gap-2 text-xs text-blue-600 font-medium">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                            Pre-filled from low/no stock alert
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category {isPrefilled && <span className="text-blue-600">*</span>}
                                            </label>
                                            <select
                                                value={row.category}
                                                onChange={(e) =>
                                                    handleChange(idx, "category", e.target.value)
                                                }
                                                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 ${isPrefilled
                                                    ? "border-blue-300 bg-blue-50 focus:ring-blue-500"
                                                    : "border-gray-300 focus:ring-blue-500"
                                                    }`}
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Part */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Part {isPrefilled && <span className="text-blue-600">*</span>}
                                            </label>
                                            <select
                                                value={row.partId}
                                                onChange={(e) =>
                                                    handleChange(idx, "partId", e.target.value)
                                                }
                                                disabled={!row.category}
                                                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 disabled:bg-gray-100 ${isPrefilled
                                                    ? "border-blue-300 bg-blue-50 focus:ring-blue-500"
                                                    : "border-gray-300 focus:ring-blue-500"
                                                    }`}
                                            >
                                                <option value="">Select Part</option>
                                                {filtered.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} ({p.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Quantity */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Quantity {isPrefilled && <span className="text-blue-600">*</span>}
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={row.quantity}
                                                    onChange={(e) =>
                                                        handleChange(idx, "quantity", e.target.value)
                                                    }
                                                    min="1"
                                                    placeholder="Qty"
                                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 ${isPrefilled
                                                        ? "border-blue-300 bg-blue-50 focus:ring-blue-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                        }`}
                                                />
                                                {rows.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemove(idx)}
                                                        className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <button
                            type="button"
                            onClick={handleAdd}
                            className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium mt-4 p-3 border-2 border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition w-full"
                        >
                            <PlusCircle size={20} /> Add Another Part
                        </button>
                    </div>

                    {/* Note */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <label className="text-lg font-semibold text-gray-800 mb-3 block">
                            Request Note <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows="4"
                            placeholder="Enter reason or special instructions..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Explain why these parts are needed and any urgency requirements
                        </p>
                    </div>

                    {/* Error / Success */}
                    {error && (
                        <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-start gap-2 text-green-600 text-sm bg-green-50 p-4 rounded-lg border border-green-200">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-medium">{success}</p>
                                <p className="text-xs text-green-600 mt-1">Your request has been submitted and is pending approval.</p>
                            </div>
                        </div>
                    )}

                    {/* Footer buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-3 rounded-xl text-sm font-medium text-white transition ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating...
                                </span>
                            ) : (
                                "Create Request"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const XIcon = () => (
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
);

export default CreatePartRequestModal;