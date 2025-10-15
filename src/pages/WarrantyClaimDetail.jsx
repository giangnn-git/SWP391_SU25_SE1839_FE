import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
    ArrowLeft,
    Image as ImageIcon,
    Package,
    Loader,
    AlertCircle,
    Car,
    RefreshCcw
} from "lucide-react";
import axios from "../services/axios.customize";

const ClaimDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [claimDetail, setClaimDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewImg, setPreviewImg] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    // Fetch claim detail
    const fetchDetail = async () => {
        try {
            const res = await axios.get(`/api/api/claims/${id}`);
            const data = res.data.data;
            setClaimDetail(data);
            setSelectedStatus(data.fcr?.currentStatus);
        } catch (err) {
            console.error("Failed to fetch claim detail:", err);
        } finally {
            setLoading(false);
        }
    };

    // Update claim status
    const handleStatusUpdate = async () => {
        if (!selectedStatus) return;
        try {
            setUpdating(true);
            await axios.put(`/api/api/claims/${id}`, { changeStatus: selectedStatus });
            toast.success("Status updated successfully!");
            fetchDetail();
        } catch (err) {
            console.error("Failed to update status:", err);
            toast.error("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    // Helper: format date array [year, month, day, hour?, minute?] to DD/MM/YYYY or DD/MM/YYYY HH:mm
    const formatDateTime = (dateArray) => {
        if (!Array.isArray(dateArray) || dateArray.length < 3) return "–";
        const [year, month, day,] = dateArray;
        return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year} `;
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
                            <p className="text-red-700 text-sm mt-1">
                                The claim you're looking for doesn't exist or has been removed.
                            </p>
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

    const { fcr, partCLiam, images } = claimDetail;

    return (
        <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Back Button & Title */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition"
                    >
                        <ArrowLeft size={18} />
                        Back to Claims
                    </button>

                    {/* Breadcrumb */}
                    <div className="text-sm text-gray-500 mb-2">
                        <Link to="/" className="hover:underline text-blue-600">Dashboard</Link>
                        <span className="mx-1">/</span>
                        <Link to="/warranty-claims" className="hover:underline text-blue-600">Warranty Claims</Link>
                        <span className="mx-1">/</span>
                        <span className="text-gray-700 font-medium">Claim Detail</span>
                    </div>

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
                        <InfoItem label="Status" value={fcr?.currentStatus} />
                        <InfoItem
                            label="Claim Date"
                            value={formatDateTime(fcr?.claimDate)}
                        />
                    </div>

                    {fcr?.description && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-700 leading-relaxed">{fcr.description}</p>
                        </div>
                    )}
                </div>

                {/* Vehicle Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Car size={22} className="text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900"> Vehicle Information</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem label="Model Name" value={fcr?.modelName} />
                        <InfoItem label="VIN" value={fcr?.vin} />
                        <InfoItem label="Mileage" value={`${fcr?.milege} km`} />
                        <InfoItem label="Production Year" value={fcr?.prodcutYear} />
                    </div>
                </div>

                {/* Claim Status (Update Section) */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <RefreshCcw size={20} className="text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Claim Status</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500"
                            value={selectedStatus || ""}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            {[fcr?.currentStatus, ...(fcr?.availableStatuses || [])].map(
                                (status, i) => (
                                    <option key={i} value={status}>
                                        {status}
                                    </option>
                                )
                            )}
                        </select>

                        <button
                            onClick={handleStatusUpdate}
                            disabled={updating}
                            className={`px-4 py-2 rounded-lg text-white font-medium ${updating
                                ? "bg-gray-400"
                                : "bg-blue-600 hover:bg-blue-700 transition"
                                }`}
                        >
                            {updating ? "Updating..." : "Update Status"}
                        </button>
                    </div>
                </div>

                {/* Requested Parts */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Package size={20} className="text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Requested Parts</h2>
                    </div>
                    {partCLiam?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">
                                            Part Name
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">
                                            Category
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">
                                            Description
                                        </th>
                                        <th className="text-right py-3 px-4 text-xs font-bold text-gray-900 uppercase">
                                            Quantity
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {partCLiam.map((part, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">{part.name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{part.category}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{part.description}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700 text-right font-semibold">{part.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No requested parts.</p>
                    )}
                </div>

                {/* Claim Images */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
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
            </div>

            {/* Image Preview Modal */}
            {previewImg && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setPreviewImg(null)}
                >
                    <div className="relative max-w-3xl w-full">
                        <img
                            src={previewImg}
                            alt="Preview"
                            className="w-full h-auto rounded-lg shadow-2xl"
                        />
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

// Reusable info item
const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-base font-medium text-gray-900">{value || "–"}</p>
    </div>
);

export default ClaimDetail;
