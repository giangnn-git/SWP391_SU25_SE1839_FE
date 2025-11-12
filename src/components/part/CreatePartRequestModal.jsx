import { useEffect, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  getAllPartsApi,
  createPartRequestApi,
} from "../../services/api.service";

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
        } else {
          setError("Unexpected response format from server.");
        }
      } catch {
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

    const payload = { note: note.trim(), details };

    try {
      setLoading(true);
      const res = await createPartRequestApi(payload);

      if (res?.status === 200 || res?.status === 201) {
        setSuccess("Request created successfully!");
        onCreated?.();
        setTimeout(() => onClose?.(), 1200);
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
                Add parts needed for warranty service
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
              return (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={row.category}
                        onChange={(e) =>
                          handleChange(idx, "category", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
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
                        Part
                      </label>
                      <select
                        value={row.partId}
                        onChange={(e) =>
                          handleChange(idx, "partId", e.target.value)
                        }
                        disabled={!row.category}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
                        Quantity
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
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
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
          </div>

          {/* Error / Success */}
          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
              {success}
            </p>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl text-sm font-medium text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Creating..." : "Create Request"}
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
