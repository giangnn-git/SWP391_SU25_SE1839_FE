// import { useState, useEffect } from "react";
// import { PlusCircle, Trash2 } from "lucide-react";
// import { createPartRequestApi, getAllPartsApi } from "../../services/api.service";

// const CreatePartRequestModal = ({ onClose, onCreated }) => {
//     const [parts, setParts] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [partRows, setPartRows] = useState([{ category: "", partId: "", quantity: "" }]);
//     const [note, setNote] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState("");

//     // ✅ Load all parts from API
//     useEffect(() => {
//         const fetchParts = async () => {
//             try {
//                 const res = await getAllPartsApi();
//                 if (res.status === 200 && res.data?.data?.partList) {
//                     const list = res.data.data.partList;
//                     setParts(list);
//                     setCategories([...new Set(list.map((p) => p.partCategory))]);
//                     setError("");
//                 } else {
//                     setError("⚠️ Unexpected response format from server.");
//                 }
//             } catch (err) {
//                 console.error("❌ Failed to fetch parts:", err);
//                 setError("Failed to load part list.");
//             }
//         };
//         fetchParts();
//     }, []);

//     // ✅ Change handlers
//     const handleCategoryChange = (idx, cat) => {
//         const updated = [...partRows];
//         updated[idx].category = cat;
//         updated[idx].partId = "";
//         setPartRows(updated);
//     };

//     const handlePartChange = (idx, partId) => {
//         const updated = [...partRows];
//         updated[idx].partId = partId;
//         setPartRows(updated);
//     };

//     const handleQuantityChange = (idx, qty) => {
//         const updated = [...partRows];
//         updated[idx].quantity = qty;
//         setPartRows(updated);
//     };

//     const handleAddRow = () => {
//         setPartRows([...partRows, { category: "", partId: "", quantity: "" }]);
//     };

//     const handleRemoveRow = (idx) => {
//         setPartRows(partRows.filter((_, i) => i !== idx));
//     };

//     // ✅ Submit logic
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError("");
//         setSuccess("");

//         const invalid = partRows.some(
//             (r) => !r.partId || !r.quantity || parseInt(r.quantity) <= 0
//         );
//         if (invalid || !note) {
//             setError("Please fill all required fields correctly!");
//             return;
//         }

//         // 🔥 Chuẩn hóa dữ liệu gửi BE
//         const details = partRows.map((r) => {
//             const selectedPart = parts.find((p) => p.id === parseInt(r.partId));
//             return {
//                 partCode: selectedPart?.code || "",
//                 requestedQuantity: parseInt(r.quantity),
//             };
//         });

//         const payload = { note, details };
//         console.log("🚀 Payload gửi lên BE:", JSON.stringify(payload, null, 2));

//         try {
//             setLoading(true);
//             const res = await createPartRequestApi(payload);
//             console.log("✅ Response từ BE:", res);

//             if (res?.status === 200 || res?.status === 201) {
//                 setSuccess("✅ Request created successfully!");
//             } else {
//                 // Nếu backend trả lỗi 500 nhưng vẫn insert DB, ta vẫn cho hiển thị success
//                 setSuccess("⚠️ Request may have been created successfully (non-200 response).");
//             }

//             onCreated && onCreated();
//             setTimeout(() => onClose(), 1000);
//         } catch (err) {
//             console.error("❌ Error creating part request:", err);

//             if (err.response?.status === 500) {
//                 // BE vẫn insert nhưng trả lỗi — hiển thị thông báo mềm
//                 setSuccess("⚠️ Backend returned 500, but request was likely created successfully.");
//                 onCreated && onCreated();
//                 setTimeout(() => onClose(), 1200);
//             } else {
//                 setError("Failed to create request. Please try again.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 border border-gray-100">
//                 <h2 className="text-xl font-semibold text-gray-900 mb-4">New Part Request</h2>

//                 <form onSubmit={handleSubmit} className="space-y-5">
//                     {/* Requested Parts */}
//                     <div>
//                         <label className="block text-sm font-semibold text-gray-800 mb-2">
//                             Requested Parts
//                         </label>

//                         {partRows.map((row, idx) => {
//                             const availableParts = parts.filter(
//                                 (p) => p.partCategory === row.category
//                             );
//                             return (
//                                 <div
//                                     key={idx}
//                                     className="flex items-center gap-3 mb-3 flex-wrap"
//                                 >
//                                     <select
//                                         value={row.category}
//                                         onChange={(e) => handleCategoryChange(idx, e.target.value)}
//                                         className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
//                                     >
//                                         <option value="">Select Category</option>
//                                         {categories.map((cat) => (
//                                             <option key={cat} value={cat}>
//                                                 {cat}
//                                             </option>
//                                         ))}
//                                     </select>

//                                     <select
//                                         value={row.partId}
//                                         onChange={(e) => handlePartChange(idx, e.target.value)}
//                                         className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
//                                         disabled={!row.category}
//                                     >
//                                         <option value="">Select Part</option>
//                                         {availableParts.map((p) => (
//                                             <option key={p.id} value={p.id}>
//                                                 {p.name} ({p.code})
//                                             </option>
//                                         ))}
//                                     </select>

//                                     <input
//                                         type="number"
//                                         placeholder="Quantity"
//                                         value={row.quantity}
//                                         onChange={(e) => handleQuantityChange(idx, e.target.value)}
//                                         className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28"
//                                     />

//                                     {partRows.length > 1 && (
//                                         <button
//                                             type="button"
//                                             onClick={() => handleRemoveRow(idx)}
//                                             className="text-red-500 hover:text-red-700"
//                                         >
//                                             <Trash2 size={18} />
//                                         </button>
//                                     )}
//                                 </div>
//                             );
//                         })}

//                         <button
//                             type="button"
//                             onClick={handleAddRow}
//                             className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
//                         >
//                             <PlusCircle size={16} /> Add Part
//                         </button>
//                     </div>

//                     {/* Note */}
//                     <div>
//                         <label className="block text-sm font-semibold text-gray-800 mb-1">
//                             Note <span className="text-red-500">*</span>
//                         </label>
//                         <textarea
//                             className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
//                             rows="3"
//                             placeholder="Describe issue or reason..."
//                             value={note}
//                             onChange={(e) => setNote(e.target.value)}
//                         />
//                     </div>

//                     {/* Messages */}
//                     {error && (
//                         <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
//                             {error}
//                         </div>
//                     )}
//                     {success && (
//                         <div className="text-sm text-green-600 bg-green-50 border border-green-200 p-2 rounded-lg">
//                             {success}
//                         </div>
//                     )}

//                     {/* Buttons */}
//                     <div className="flex justify-end gap-3 pt-3">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition ${loading
//                                 ? "bg-gray-400 cursor-not-allowed"
//                                 : "bg-blue-600 hover:bg-blue-700"
//                                 }`}
//                         >
//                             {loading ? "Submitting..." : "Create Request"}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default CreatePartRequestModal;
