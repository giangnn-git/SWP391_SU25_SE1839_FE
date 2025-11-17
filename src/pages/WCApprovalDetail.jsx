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

    // Parts
    const [editedParts, setEditedParts] = useState([]);
    const [isEditingParts, setIsEditingParts] = useState(false);
    const [partNotes, setPartNotes] = useState({});
    const [partStatuses, setPartStatuses] = useState({});



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
    // useEffect(() => {
    //     const fetchCategories = async () => {
    //         try {
    //             const res = await axios.get("/api/api/categories");
    //             setCategories(res.data.data.category || []);
    //         } catch (err) {
    //             console.error("Failed to fetch categories:", err);
    //         }
    //     };
    //     fetchCategories();
    // }, []);

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

    //Update part claim
    const handlePartClaimStatusUpdate = async (partClaimId, status, note = "") => {
        if (status === "REJECTED" && !note.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        try {
            setUpdating(true);
            const payload = { status, note };
            const res = await axios.put(`/api/api/claimId/part-claims/${partClaimId}/status`, payload);
            toast.success("Status updated successfully");

            // Refresh part claims
            const updatedClaim = await axios.get(`/api/api/claims/${id}`);
            setClaimDetail(updatedClaim.data.data);

            // Clear local state for this part
            setPartStatuses(prev => ({ ...prev, [partClaimId]: updatedClaim.data.data.partClaimsAndCampaigns.find(p => p.partClaimId === partClaimId)?.status || "" }));
            setPartNotes(prev => ({ ...prev, [partClaimId]: "" }));
        } catch (err) {
            console.error("Failed to update part claim status:", err);
            toast.error("Failed to update part claim status");
        } finally {
            setUpdating(false);
        }
    };



    const handleStatusChange = (part) => {
        const status = partStatuses[part.partClaimId];
        if (status === "REJECTED" && !partNotes[part.partClaimId]?.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        handlePartClaimStatusUpdate(part.partClaimId, status, partNotes[part.partClaimId] || "");
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
        if (!Array.isArray(dateArray)) return "–";
        const [year, month, day] = dateArray;
        if (year && month && day) return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
        return "–";
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
                    <h1 className="text-3xl font-bold text-gray-900">Warranty Claim Detail</h1>
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

                {/* View Policy */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Car size={22} className="text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-900">Vehicle Information</h2>
                        </div>


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
                {/* Images */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ImageIcon size={20} className="text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Claim Images</h2>
                    </div>

                    {Array.isArray(images) && images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {images.map((imgObj, i) => {
                                if (!imgObj?.image) return null;

                                return (
                                    <div
                                        key={i}
                                        className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition"
                                        onClick={() => setPreviewImg(imgObj.image)}
                                    >
                                        <img
                                            src={imgObj.image}
                                            alt={`Claim image ${i + 1} of ${images.length}`}
                                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition"></div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <ImageIcon size={40} />
                            <p className="mt-2 text-sm">No images available</p>
                        </div>
                    )}
                </div>


                {/* Claim Status & Parts */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <RefreshCcw size={20} className="text-blue-600" />
                            <h2 className="text-lg font-bold text-gray-900">Claim Status & Parts</h2>
                        </div>
                        {fcr?.currentStatus === "DRAFT" &&
                            (!editedParts?.length || editedParts.length === 0) && (
                                <button
                                    onClick={() => setIsEditingParts(!isEditingParts)}
                                    className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition"
                                >
                                    {isEditingParts ? "Cancel Edit" : "Edit Parts"}
                                </button>
                            )}

                    </div>

                    {/* Status + Reason + Update */}
                    <div className="mb-6">
                        <div className="flex items-center gap-4 mb-3">
                            {/* <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500"
                                value={selectedStatus || ""}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                {statuses.map((status, i) => (
                                    <option key={i} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select> */}

                            {/* {fcr?.currentStatus === "PENDING" && (
                                <button
                                    onClick={handleUpdate}
                                    disabled={updating}
                                    className={`px-4 py-2 rounded-lg text-white font-medium ${updating
                                        ? "bg-gray-400"
                                        : "bg-blue-600 hover:bg-blue-700 transition"
                                        }`}
                                >
                                    {updating ? "Updating..." : "Update Status"}
                                </button>
                            )} */}

                            <InfoItem
                                label={<span className="text-lg font-semibold">Status</span>}
                                value={
                                    fcr?.currentStatus === "REJECTED" && fcr?.rejectReason
                                        ? `${fcr.currentStatus} (Reason: ${fcr.rejectReason})`
                                        : fcr?.currentStatus
                                }
                            />


                            {isEditingParts && fcr?.currentStatus === "DRAFT" && (
                                <button
                                    onClick={handleSaveParts}
                                    disabled={updating}
                                    className={`px-4 py-2 ml-3 rounded-lg text-white font-medium ${updating
                                        ? "bg-gray-400"
                                        : "bg-green-600 hover:bg-green-700 transition"
                                        }`}
                                >
                                    {updating ? "Saving..." : "Save Parts"}
                                </button>
                            )}

                            {/* Nút View Policy bên phải */}
                            <button
                                onClick={() => {
                                    const ModelVehicle = {
                                        id: fcr?.modelId,
                                        name: fcr?.modelName,
                                        releaseYear: fcr?.productYear,
                                        isInProduction: true,
                                        description: "Policy",
                                    };
                                    setSelectedVehicle(ModelVehicle);
                                    setShowPolicyModal(true);
                                }}
                                className="ml-auto flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition"
                            >
                                <Eye size={16} />
                                <span>View Policy</span>
                            </button>
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

                    {/* Part Claims Table (từ API partClaimsAndCampaigns) */}
                    {claimDetail.partClaimsAndCampaigns && claimDetail.partClaimsAndCampaigns.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Part Claims</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">Part Name</th>
                                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">Category</th>
                                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">Quantity</th>
                                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">Estimated Cost</th>
                                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">Effect</th>
                                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">Policy</th>
                                            {/* <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">Coverage</th> */}
                                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">Conditional</th>
                                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {claimDetail.partClaimsAndCampaigns.map((part) => {
                                            const isLocked = part.status === "APPROVED" || part.status === "REJECTED";
                                            const selectedPartStatus = partStatuses[part.partClaimId] || part.status || "";
                                            const showNoteInput = selectedPartStatus === "REJECTED";

                                            return (
                                                <tr key={part.partClaimId} className="hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{part.partClaimName}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{part.category}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{part.quantity}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">${part.estimatedCost?.toFixed(2) || 0}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{Array.isArray(part.effect) ? formatDateTime(part.effect) : "-"}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{part.policyName || "-"}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{part.conditional}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 flex flex-col gap-2">
                                                        {/* Select status */}
                                                        <select
                                                            value={selectedPartStatus}
                                                            disabled={isLocked}
                                                            onChange={(e) =>
                                                                setPartStatuses(prev => ({ ...prev, [part.partClaimId]: e.target.value }))
                                                            }
                                                            className="border border-gray-300 rounded px-2 py-1 w-full"
                                                        >
                                                            <option value="">Select Status</option>
                                                            <option value="APPROVED">APPROVED</option>
                                                            <option value="REJECTED">REJECTED</option>
                                                        </select>

                                                        {/* Note input for REJECTED */}
                                                        {showNoteInput && !isLocked && (
                                                            <textarea
                                                                rows={2}
                                                                value={partNotes[part.partClaimId] || ""}
                                                                onChange={(e) =>
                                                                    setPartNotes(prev => ({ ...prev, [part.partClaimId]: e.target.value }))
                                                                }
                                                                placeholder="Enter reason for rejection..."
                                                                className="border border-gray-300 rounded px-2 py-1 mt-1 w-full"
                                                            />
                                                        )}

                                                        {/* Update button */}
                                                        {!isLocked && (
                                                            <button
                                                                onClick={() => handlePartClaimStatusUpdate(
                                                                    part.partClaimId,
                                                                    selectedPartStatus,
                                                                    partNotes[part.partClaimId] || ""
                                                                )}
                                                                disabled={updating || (selectedPartStatus === "REJECTED" && !partNotes[part.partClaimId]?.trim())}
                                                                className={`px-3 py-1 rounded-lg text-white font-medium ${updating ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 transition"}`}
                                                            >
                                                                {updating ? "Updating..." : "Update"}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>


                                </table>
                            </div>
                        </div>
                    )}



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
