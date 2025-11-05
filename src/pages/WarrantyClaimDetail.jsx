import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Image as ImageIcon, Loader, AlertCircle, Car, RefreshCcw, Eye, X } from "lucide-react";
import ViewVehicleModal from "../components/vehicles/ViewVehicleModal";
import axios from "../services/axios.customize";

const ClaimDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [claimDetail, setClaimDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewImg, setPreviewImg] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [updating, setUpdating] = useState(false);
    const [reason, setReason] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState(null);


    // View Policy modal control
    const [showPolicyModal, setShowPolicyModal] = useState(false);

    //View Update Part Modal
    const [showUpdateAllModal, setShowUpdateAllModal] = useState(false);
    const [tempParts, setTempParts] = useState([]);


    // Parts
    const [editedParts, setEditedParts] = useState([]);
    const [isEditingParts, setIsEditingParts] = useState(false);

    // Categories & Parts
    const [categories, setCategories] = useState([]);
    const [partsByCategory, setPartsByCategory] = useState({});
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedPart, setSelectedPart] = useState(null);
    const [partQuantity, setPartQuantity] = useState(1);

    // Fetch claim detail
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/api/api/claims/${id}`);
                const data = res.data.data;
                setClaimDetail(data);
                setSelectedStatus(data.fcr?.currentStatus);
                setEditedParts(data.partCLiam || []);
            } catch (err) {
                console.error("Failed to fetch claim detail:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("/api/api/categories");
                setCategories(res.data.data.category || []);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch parts by category
    const fetchParts = async (category) => {
        if (!category || partsByCategory[category]) return;
        try {
            const res = await axios.get(`/api/api/parts/${category}`);
            setPartsByCategory((prev) => ({ ...prev, [category]: res.data.data.partList || [] }));
        } catch (err) {
            console.error("Failed to fetch parts:", err);
        }
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setSelectedPart(null);
        fetchParts(category);
    };

    const handleAddPart = () => {
        if (!selectedCategory || !selectedPart || partQuantity <= 0) return;

        const existsIndex = editedParts.findIndex((p) => p.id === selectedPart.id);
        if (existsIndex >= 0) {
            const newParts = [...editedParts];
            newParts[existsIndex].quantity += partQuantity;
            setEditedParts(newParts);
        } else {
            setEditedParts([...editedParts, { ...selectedPart, category: selectedCategory, quantity: partQuantity }]);
        }

        setSelectedCategory("");
        setSelectedPart(null);
        setPartQuantity(1);
    };

    // Updated handleUpdate with "reason"
    const handleUpdate = async () => {
        if (!selectedStatus) {
            toast.error("Please select a status");
            return;
        }

        if (selectedStatus === "REJECTED" && !reason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        try {
            setUpdating(true);
            const payload = {
                changeStatus: selectedStatus,
                ...(selectedStatus === "REJECTED" && { reason: reason.trim() }),
                parts: editedParts.map((p) => ({
                    id: p.id,
                    quantity: Number(p.quantity),
                })),
            };

            await axios.patch(`/api/api/claims/${id}`, payload);
            toast.success("Updated successfully!");
            const channel = new BroadcastChannel("claim_updates");
            channel.postMessage({ type: "CLAIM_UPDATED", id });
            channel.close();


            // Fetch latest claim data after update
            const res = await axios.get(`/api/api/claims/${id}`);
            const updatedData = res.data.data;

            // Update local state with new detail
            setClaimDetail(updatedData);
            setSelectedStatus(updatedData.fcr?.currentStatus || "");
            setEditedParts(updatedData.partCLiam || []);
            setReason("");
            setIsEditingParts(false);
        } catch (err) {
            console.error("Failed to update claim:", err);
            toast.error("Failed to update");
        } finally {
            setUpdating(false);
        }
    };

    const handleSaveParts = async () => {
        try {
            setUpdating(true);
            const payload = {
                parts: editedParts.map((p) => ({
                    id: p.id,
                    quantity: Number(p.quantity),
                })),
            };

            await axios.put(`/api/api/claims/part-claims/${id}`, payload);
            toast.success("Parts saved successfully!");

            const res = await axios.get(`/api/api/claims/${id}`);
            setClaimDetail(res.data.data);
            setEditedParts(res.data.data.partCLiam || []);
            setIsEditingParts(false);
        } catch (err) {
            console.error("Failed to save parts:", err);
            toast.error("Failed to save parts");
        } finally {
            setUpdating(false);
        }
    };


    const formatDateTime = (dateArray) => {
        if (!Array.isArray(dateArray) || dateArray.length < 3) return "–";
        const [year, month, day] = dateArray;
        return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    };

    const handleUpdatePartQuantity = async (partId, quantity) => {
        try {
            if (quantity < 0) {
                toast.error("Quantity must be >= 0");
                return;
            }

            const payload = { partId, quantity: Number(quantity) };
            console.log("Payload gửi:", payload);

            const res = await axios.put(
                `/api/api/${id}/parts/quantity`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            toast.success(res.data?.message || "Cập nhật số lượng thành công");

            // Refresh dữ liệu
            const refreshed = await axios.get(`/api/api/claims/${id}`);
            setClaimDetail(refreshed.data.data);
            setEditedParts(refreshed.data.data.partCLiam || []);
        } catch (err) {
            console.error("Lỗi khi update part quantity:", err);
            toast.error("Không thể cập nhật số lượng");
        }
    };




    if (loading)
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Loader className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );

    if (!claimDetail)
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="max-w-2xl mx-auto bg-white rounded-lg border border-red-200 p-6">
                    <div className="flex gap-3 items-start">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                        <div>
                            <h3 className="font-semibold text-red-900">Claim Not Found</h3>
                            <p className="text-red-700 text-sm mt-1">The claim you're looking for doesn't exist or has been removed.</p>
                            <button
                                onClick={() => navigate(-1)}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );

    const { fcr, images } = claimDetail;
    const statuses = Array.from(new Set([fcr?.currentStatus, ...(fcr?.availableStatuses || [])]));

    return (
        <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition"
                    >
                        <ArrowLeft size={18} /> Back to Claims
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Warranty Claim Details</h1>
                    <p className="text-gray-600 mt-1">
                        Claim ID:{" "}
                        <span className="font-semibold text-gray-900">
                            WC-{String(fcr?.id || id).padStart(3, "0")}
                        </span>
                    </p>
                </div>

                {/* Claim Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Claim Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem label="Sender Name" value={fcr?.senderName} />
                        <InfoItem label="User Name" value={fcr?.userName} />
                        <InfoItem label="Price" value={`$${fcr?.price || 0}`} />
                        <InfoItem label="Priority" value={fcr?.priority} />
                        <InfoItem
                            label="Status"
                            value={
                                fcr?.currentStatus === "REJECTED" && fcr?.rejectReason
                                    ? `${fcr.currentStatus} (Reason: ${fcr.rejectReason})`
                                    : fcr?.currentStatus
                            }
                        />
                        <InfoItem label="Claim Date" value={formatDateTime(fcr?.claimDate)} />

                        <InfoItem
                            label="Recall Status"
                            value={fcr?.statusRecall === "AGREED_RECALL" ? "AGREED_RECALL" : (fcr?.statusRecall || "No Recall")}
                        />
                    </div>

                    {fcr?.description && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-700 leading-relaxed">{fcr.description}</p>
                        </div>
                    )}
                </div>



                {/* <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Car size={22} className="text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Vehicle Information</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem label="Model Name" value={fcr?.modelName} />
                        <InfoItem label="VIN" value={fcr?.vin} />
                        <InfoItem label="License Plate" value={fcr?.licensePlate} />
                        <InfoItem label="Mileage" value={`${fcr?.milege || 0} km`} />
                        <InfoItem label="Production Year" value={fcr?.productYear} />
                    </div>
                </div> */}

                {/* View Policy */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Car size={22} className="text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-900">Vehicle Information</h2>
                        </div>

                        {/* <button
                            onClick={() => {
                                const ModelVehicle = {
                                    id: fcr?.modelId,
                                    name: fcr?.modelName,
                                    releaseYear: fcr?.productYear,
                                    isInProduction: true,
                                    description: "Vehicle description placeholder",
                                };
                                setSelectedVehicle(ModelVehicle);
                                setShowPolicyModal(true);
                            }}
                            className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition"
                        >
                            <Eye size={16} />
                            <span>View Policy</span>
                        </button> */}
                    </div>
                    {/* Vehicle Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem label="Model Name" value={fcr?.modelName} />
                        <InfoItem label="VIN" value={fcr?.vin} />
                        <InfoItem label="License Plate" value={fcr?.licensePlate} />
                        <InfoItem label="Mileage" value={`${fcr?.milege || 0} km`} />
                        <InfoItem label="Production Year" value={fcr?.productYear} />
                    </div>
                </div>



                {/* View Vehicle Modal */}
                {showPolicyModal && selectedVehicle && (
                    <ViewVehicleModal
                        vehicle={selectedVehicle}
                        onClose={() => setShowPolicyModal(false)}
                    />
                )}

                {/* Images */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ImageIcon size={20} className="text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Claim Images</h2>
                    </div>
                    {Array.isArray(images) && images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {images.map((img, i) => {
                                const base64 = typeof img === "string" ? img : img?.image;
                                if (!base64) return null;
                                const imageSrc = base64.startsWith("data:image")
                                    ? base64
                                    : `data:image/jpeg;base64,${base64}`;
                                return (
                                    <div
                                        key={i}
                                        className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200"
                                        onClick={() => setPreviewImg(imageSrc)}
                                    >
                                        <img
                                            src={imageSrc}
                                            alt={`Claim image ${i + 1}`}
                                            className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500">No images available.</p>
                    )}
                </div>

                {/* Claim Status & Parts */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <RefreshCcw size={20} className="text-blue-600" />
                            <h2 className="text-lg font-bold text-gray-900">Claim Status & Parts</h2>
                        </div>
                        {fcr?.currentStatus === "DRAFT" && (
                            <button
                                onClick={() => {
                                    setTempParts(editedParts.map(p => ({ ...p }))); // clone để chỉnh tạm
                                    setShowUpdateAllModal(true);
                                }}
                                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                                Update All Parts
                            </button>
                        )}
                    </div>

                    {/* Status + Reason + Update */}
                    <div className="mb-6">
                        <div className="flex items-center gap-4 mb-3">
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500"
                                value={selectedStatus || ""}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                {statuses.map((status, i) => (
                                    <option key={i} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            {fcr?.currentStatus === "DRAFT" && (
                                <button
                                    onClick={handleUpdate}
                                    disabled={updating}
                                    className={`px-4 py-2 rounded-lg text-white font-medium ${updating ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 transition"
                                        }`}
                                >
                                    {updating ? "Updating..." : "Update Status"}
                                </button>
                            )}


                            {isEditingParts && fcr?.currentStatus === "DRAFT" && (
                                <button
                                    onClick={handleSaveParts}
                                    disabled={updating}
                                    className={`px-4 py-2 ml-3 rounded-lg text-white font-medium ${updating ? "bg-gray-400" : "bg-green-600 hover:bg-green-700 transition"
                                        }`}
                                >
                                    {updating ? "Saving..." : "Save Parts"}
                                </button>
                            )}


                        </div>

                        {selectedStatus === "REJECTED" && (
                            <div className="flex flex-col gap-2 mb-4">
                                <label className="text-sm font-medium text-gray-700">Reason:</label>
                                <textarea
                                    rows={2}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </div>


                    {/* Add Part */}
                    {isEditingParts && (
                        <div className="flex gap-3 mb-4 flex-wrap">
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2"
                            >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>

                            {selectedCategory && (
                                <select
                                    value={selectedPart?.id || ""}
                                    onChange={(e) =>
                                        setSelectedPart(
                                            partsByCategory[selectedCategory]?.find(
                                                (p) => p.id === Number(e.target.value)
                                            )
                                        )
                                    }
                                    className="border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="">Select Part</option>
                                    {partsByCategory[selectedCategory]?.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {selectedPart && (
                                <input
                                    type="number"
                                    min="1"
                                    value={partQuantity}
                                    onChange={(e) => setPartQuantity(Number(e.target.value))}
                                    className="border border-gray-300 rounded-lg px-2 py-1 w-20"
                                />
                            )}

                            <button
                                type="button"
                                onClick={handleAddPart}
                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Add Part
                            </button>
                        </div>
                    )}

                    {/* Parts Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">Part Name</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">Category</th>
                                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-900 uppercase">Quantity</th>
                                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-900 uppercase">Recommended</th>
                                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-900 uppercase">Stock</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {editedParts.length > 0 ? (
                                    editedParts.map((part, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">{part.name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{part.category}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                {part.quantity}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700 text-right">{part.recommendedQuantity ?? "–"}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700 text-right">{part.remainingStock ?? "–"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-6 text-center text-gray-500 italic">
                                            No parts have been added yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                    </div>
                </div>


            </div>

            {/* Image Preview Modal */}
            {previewImg && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setPreviewImg(null)}
                >
                    <div className="relative max-w-3xl w-full">
                        <img src={previewImg} alt="Preview" className="w-full h-auto rounded-lg shadow-2xl" />
                        <button
                            onClick={() => setPreviewImg(null)}
                            className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition shadow-lg"
                            title="Close preview"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Update Part Modal */}
            {showUpdateAllModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative">
                        <button
                            onClick={() => setShowUpdateAllModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Update All Parts</h2>

                        <div className="max-h-[400px] overflow-y-auto border rounded-md">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="py-2 px-3 text-left font-semibold text-gray-700">Part Name</th>
                                        <th className="py-2 px-3 text-center font-semibold text-gray-700">Category</th>
                                        <th className="py-2 px-3 text-center font-semibold text-gray-700">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tempParts.map((part, i) => (
                                        <tr key={i} className="border-b hover:bg-gray-50">
                                            <td className="py-2 px-3">{part.name}</td>
                                            <td className="py-2 px-3 text-center">{part.category}</td>
                                            <td className="py-2 px-3 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={part.quantity}
                                                    onChange={(e) => {
                                                        const newParts = [...tempParts];
                                                        newParts[i].quantity = Number(e.target.value);
                                                        setTempParts(newParts);
                                                    }}
                                                    className="border border-gray-300 rounded-md px-2 py-1 w-20 text-right"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end gap-3 mt-5">
                            <button
                                onClick={() => setShowUpdateAllModal(false)}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const payload = tempParts.map(p => ({
                                            id: p.partId,
                                            quantity: p.quantity
                                        }));

                                        await axios.put(
                                            `/api/api/${id}/parts/quantity`,
                                            payload,
                                            { headers: { "Content-Type": "application/json" } }
                                        );

                                        toast.success("All parts updated successfully!");
                                        setShowUpdateAllModal(false);

                                        // refresh lại data
                                        const res = await axios.get(`/api/api/claims/${id}`);
                                        setClaimDetail(res.data.data);
                                        setEditedParts(res.data.data.partCLiam || []);
                                    } catch (err) {
                                        console.error(err);
                                        toast.error("Failed to update all parts");
                                    }
                                }}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-base font-medium text-gray-900">{value || "–"}</p>
    </div>
);

export default ClaimDetail;
