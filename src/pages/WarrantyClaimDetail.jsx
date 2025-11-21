import { useEffect, useState } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader,
  AlertCircle,
  Car,
  RefreshCcw,
  Eye,
  X,
  PlusCircle,
} from "lucide-react";
import ViewVehicleModal from "../components/vehicles/ViewVehicleModal";
import CreatePartRequestModal from "../components/part/CreatePartRequestModal";
import axios from "../services/axios.customize";

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claimDetail, setClaimDetail] = useState(null);
  const [activeTab, setActiveTab] = useState("technicians");
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [showModal, setShowModal] = useState(false);

  // View Policy modal control
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Assignment / technician flow
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [techDiagnosis, setTechDiagnosis] = useState("");
  const [techAttachments, setTechAttachments] = useState([]);
  const [techUploading, setTechUploading] = useState(false);
  const [techViewingDetail, setTechViewingDetail] = useState(false);
  const { currentUser } = useCurrentUser();

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
  // keep quantity as string while editing so user can type freely
  const [partQuantity, setPartQuantity] = useState("1");
  // Parts added by the technician in the Technician Work panel (kept local to technician tab)
  const [techParts, setTechParts] = useState([]);
  const [techPreviews, setTechPreviews] = useState([]);

  // Fetch claim detail
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error("Missing claim id");
        const res = await axios.get(`/api/api/claims/${id}`);
        const data = res.data.data;
        console.log("Fetched claim detail:", data);
        setClaimDetail(data);
        // populate technicians from claim response if available
        setTechnicians(data.getTechnicalsResponse?.technicians || []);
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

  // technicians are provided inside claim detail response (getTechnicalsResponse)

  // normalize other API paths used in file (remove duplicate /api/api) via replacements below when calling

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
      const vinQuery = claimDetail?.fcr?.vin ? `?vin=${encodeURIComponent(claimDetail.fcr.vin)}` : "";
      const res = await axios.get(`/api/api/parts/${encodeURIComponent(category)}${vinQuery}`);
      const list = res.data?.data?.partList || [];
      // normalize part objects to ensure consistent fields (id, name, code, partId)
      const normalized = list.map((p) => ({
        ...p,
        id: p.id ?? p.partId,
        partId: p.partId ?? p.id,
        name: p.name ?? p.partName ?? p.partCode,
        code: p.code ?? p.partCode,
      }));
      setPartsByCategory((prev) => ({
        ...prev,
        [category]: normalized,
      }));
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
    const qty = Number(partQuantity || 0);
    if (!selectedCategory || !selectedPart || qty <= 0) return;

    const existsIndex = editedParts.findIndex((p) => String(p.id) === String(selectedPart.id));
    if (existsIndex >= 0) {
      const newParts = [...editedParts];
      newParts[existsIndex].quantity = Number(newParts[existsIndex].quantity || 0) + qty;
      setEditedParts(newParts);
    } else {
      setEditedParts([
        ...editedParts,
        { ...selectedPart, category: selectedCategory, quantity: qty },
      ]);
    }

    setSelectedCategory("");
    setSelectedPart(null);
    setPartQuantity("1");
  };

  // Add part only to the technician's temporary list (shown on Technician tab only)
  const handleAddPartTech = () => {
    const qty = 1; // technicians only choose part (default quantity 1)
    if (!selectedCategory || !selectedPart || qty <= 0) return;

    const existsIndex = techParts.findIndex((p) => String(p.id) === String(selectedPart.id));
    if (existsIndex >= 0) {
      const newParts = [...techParts];
      newParts[existsIndex].quantity = Number(newParts[existsIndex].quantity || 0) + qty;
      setTechParts(newParts);
    } else {
      setTechParts([
        ...techParts,
        { ...selectedPart, category: selectedCategory, quantity: qty },
      ]);
    }

    setSelectedCategory("");
    setSelectedPart(null);
    setPartQuantity("1");
  };

  const handleRemoveTechPart = (partId) => {
    setTechParts((prev) => prev.filter((p) => String(p.id) !== String(partId)));
  };

  // Generate previews for technician attachments
  useEffect(() => {
    if (!techAttachments || techAttachments.length === 0) {
      setTechPreviews([]);
      return;
    }
    const urls = techAttachments.map((f) => URL.createObjectURL(f));
    setTechPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [techAttachments]);

  // Fetch categories based on VIN when claim detail is loaded
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const vin = claimDetail?.fcr?.vin;
        if (!vin) return;
        const res = await axios.get(`/api/api/categories?vin=${encodeURIComponent(vin)}`);
        setCategories(res.data?.data?.category || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, [claimDetail?.fcr?.vin]);

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
      if (!id) throw new Error("Missing claim id");
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
      if (!id) throw new Error("Missing claim id");
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
    return `${String(day).padStart(2, "0")}/${String(month).padStart(
      2,
      "0"
    )}/${year}`;
  };

  const handleUpdatePartQuantity = async (partId, quantity) => {
    try {
      if (quantity < 0) {
        toast.error("Quantity must be >= 0");
        return;
      }

      if (!id) throw new Error("Missing claim id");

      const payload = { id: partId, quantity: Number(quantity) };
      console.log("Payload gửi:", payload);

      const res = await axios.put(`/api/api/${id}/parts/quantity`, payload, {
        headers: { "Content-Type": "application/json" },
      });

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
            <AlertCircle
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={24}
            />
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

  const { fcr, images } = claimDetail;
  const statuses = Array.from(
    new Set([fcr?.currentStatus, ...(fcr?.availableStatuses || [])])
  );

  const assignedTechnicianId = fcr?.technician?.id || fcr?.technicianId || fcr?.techinicianId || claimDetail?.technicianId || claimDetail?.assignedTechnicianId;
  let assignedTechnicianName =
    fcr?.technicianName ||
    fcr?.techinicianName ||
    fcr?.technician?.name ||
    fcr?.technician?.fullName ||
    fcr?.technician?.user?.name ||
    claimDetail?.technicianName ||
    claimDetail?.assignedTechnician?.name ||
    claimDetail?.assignedTo?.name ||
    "";

  // If name still missing, try to lookup from technicians list by id or common name fields
  if (!assignedTechnicianName) {
    const found = (technicians || []).find((t) => {
      if (!t) return false;
      const tids = [t?.id, t?.user?.id, t?.technicianId, t?.techinicianId].filter((x) => x !== undefined).map(String);
      if (assignedTechnicianId && tids.includes(String(assignedTechnicianId))) return true;
      // try matching common name fields
      const nameCandidates = [t?.name, t?.technicalName, t?.fullName, t?.user?.name, t?.user?.fullName].filter(Boolean).map((n) => n.toString().trim());
      if (nameCandidates.length && assignedTechnicianName && nameCandidates.includes(assignedTechnicianName)) return true;
      return false;
    });
    if (found) assignedTechnicianName = found.name || found?.user?.name || found?.technicalName || "";
  }

  const hasAssignedTechnician = Boolean(assignedTechnicianId || assignedTechnicianName);
  // A technician may be identified by id or by name depending on backend response shape.
  const currentUserName = (currentUser?.name || currentUser?.fullName || currentUser?.username || currentUser?.displayName || "").trim();

  // normalize function: lowercase, collapse whitespace
  const normalize = (s) => (s || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
  const normCurrentUserName = normalize(currentUserName);
  const normAssignedTechnicianName = normalize(assignedTechnicianName);

  // Also check the technicians list returned by the claim (getTechnicalsResponse)
  const normTechnicians = (technicians || []).map((t) => {
    const nameCandidates = [
      t?.name,
      t?.technicalName,
      t?.techinicianName,
      t?.username,
      t?.fullName,
      t?.userName,
      t?.displayName,
      t?.email,
      t?.user?.name,
      t?.user?.fullName,
      t?.user?.username,
      t?.user?.email,
    ].filter(Boolean);

    return {
      raw: t,
      idCandidates: [t?.id, t?.user?.id, t?.technicianId, t?.techinicianId].filter((x) => x !== undefined),
      names: Array.from(new Set(nameCandidates.map((n) => normalize(n)))),
      emails: [normalize(t?.email), normalize(t?.user?.email)].filter(Boolean),
    };
  });

  const isAssignedInList = (normTechnicians || []).some((t) => {
    if (!currentUser) return false;
    // id match
    const cuId = currentUser?.id !== undefined ? String(currentUser.id) : null;
    if (cuId) {
      for (const cand of t.idCandidates) {
        if (cand !== undefined && String(cand) === cuId) return true;
      }
    }

    // email match
    const cuEmail = normalize(currentUser?.email || currentUser?.username || currentUser?.userName || "");
    if (cuEmail && t.emails.length) {
      for (const e of t.emails) if (e === cuEmail) return true;
    }

    // name fuzzy match
    if (normCurrentUserName && t.names.length) {
      for (const n of t.names) {
        if (!n) continue;
        if (n === normCurrentUserName || n.includes(normCurrentUserName) || normCurrentUserName.includes(n)) return true;
      }
    }

    return false;
  });

  const isAssignedTechUser =
    currentUser?.role === "TECHNICIAN" && (
      (assignedTechnicianId !== undefined && String(currentUser?.id) === String(assignedTechnicianId)) ||
      (normAssignedTechnicianName && normCurrentUserName && (
        normAssignedTechnicianName === normCurrentUserName ||
        normAssignedTechnicianName.includes(normCurrentUserName) ||
        normCurrentUserName.includes(normAssignedTechnicianName)
      )) ||
      isAssignedInList ||
      // Temporary fallback: if claim has any assigned technician, show View Detail to TECHNICIAN role
      (hasAssignedTechnician === true)
    );

  console.log("currentUser:", currentUser, "assignedTechnicianId:", assignedTechnicianId, "assignedTechnicianName:", assignedTechnicianName, "normAssigned:", normAssignedTechnicianName, "normUser:", normCurrentUserName, "technicians:", normTechnicians, "isAssignedInList:", isAssignedInList);
  if (currentUser?.role === "TECHNICIAN" && hasAssignedTechnician) console.log("Fallback: showing detail for TECHNICIAN because claim has assigned technician");




  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:underline text-blue-600">Dashboard</Link>
          <span className="mx-1">/</span>
          <Link to="/warranty-claims" className="hover:underline text-blue-600">Warranty Claims</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-700 font-medium">Claim Detail</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition">
            <ArrowLeft size={18} /> Back to Claims
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Warranty Claim Details</h1>
          <p className="text-gray-600 mt-1">Claim ID: <span className="font-semibold text-gray-900">WC-{String(fcr?.id || id).padStart(3, "0")}</span></p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveTab("technicians")} className={`px-4 py-3 -mb-px font-medium ${activeTab === "technicians" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>Technicians</button>
            <button
              onClick={() => setActiveTab("detail")}
              title="Detail"
              className={`px-4 py-3 -mb-px font-medium ${activeTab === "detail"
                ? "border-b-2 border-blue-600 text-blue-600"
                : hasAssignedTechnician
                  ? "text-gray-600 hover:text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
                }`}
            >
              Detail
            </button>
          </div>
        </div>

        {/* Tab panels */}
        {(activeTab === "detail" || techViewingDetail) && (
          <>
            {/* Claim Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              {isAssignedTechUser && techViewingDetail && (
                <div className="flex justify-end mb-3">
                  <button onClick={() => setTechViewingDetail(false)} className="px-3 py-1 text-sm bg-gray-200 rounded">Back to Work</button>
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900 mb-4">Claim Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem label="Sender Name" value={fcr?.senderName} />
                <InfoItem label="User Name" value={fcr?.userName} />
                <InfoItem label="Price" value={`$${fcr?.price || 0}`} />
                <InfoItem label="Priority" value={fcr?.priority} />
                <InfoItem label="Status" value={fcr?.currentStatus} />
                <InfoItem label="Claim Date" value={formatDateTime(fcr?.claimDate)} />
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
                <h2 className="text-xl font-bold text-gray-900">Vehicle Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem label="Model Name" value={fcr?.modelName} />
                <InfoItem label="VIN" value={fcr?.vin} />
                <InfoItem label="License Plate" value={fcr?.licensePlate} />
                <InfoItem label="Mileage" value={`${fcr?.milege || 0} km`} />
                <InfoItem label="Production Year" value={fcr?.productYear} />
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Claim Images</h2>
              </div>
              {Array.isArray(images) && images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((imgObj, i) => (
                    imgObj?.image ? (
                      <div key={i} className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition" onClick={() => setPreviewImg(imgObj.image)}>
                        <img src={imgObj.image} alt={`Claim ${i}`} className="w-full h-40 object-cover" />
                      </div>
                    ) : null
                  ))}
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
                <h2 className="text-lg font-bold text-gray-900">Claim Status & Parts</h2>
                <div className="flex items-center gap-3">
                  {fcr?.currentStatus === "DRAFT" && !editedParts.some((p) => p.remainingStock === 0) && currentUser?.role !== "SC_STAFF" && (
                    <button onClick={() => { setTempParts(editedParts.map((p) => ({ ...p }))); setShowUpdateAllModal(true); }} className="px-3 py-2 bg-blue-600 text-white rounded-md">Update All Parts</button>
                  )}
                  {fcr?.currentStatus === "DRAFT" && editedParts.some((p) => p.remainingStock === 0 || (p.remainingStock > 0 && p.remainingStock <= 10)) && currentUser?.role !== "SC_STAFF" && (
                    <button onClick={() => setShowModal(true)} className="px-3 py-2 bg-amber-500 text-white rounded-md">Create Part Request</button>
                  )}
                </div>
              </div>

              <div className="mb-4 flex items-center gap-3">
                {currentUser?.role === "SC_STAFF" ? (
                  <div className="px-3 py-2 border rounded bg-gray-100 text-gray-700 font-semibold">
                    {fcr?.currentStatus || "–"}
                  </div>
                ) : (
                  <>
                    <select value={selectedStatus || ""} onChange={(e) => setSelectedStatus(e.target.value)} className="border rounded px-3 py-2">
                      {statuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                    {fcr?.currentStatus === "DRAFT" && <button onClick={handleUpdate} disabled={updating} className="px-4 py-2 bg-blue-600 text-white rounded">{updating ? 'Updating...' : 'Update Status'}</button>}
                  </>
                )}
                {/* Edit parts inline */}
                {fcr?.currentStatus === "ASSIGNED" && (
                  !isEditingParts ? (
                    <button onClick={() => setIsEditingParts(true)} className="px-4 py-2 bg-amber-500 text-white rounded">Update Parts</button>
                  ) : null
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Part Name</th>
                      <th className="py-2 text-left">Category</th>
                      <th className="py-2 text-right">Recommended</th>
                      <th className="py-2 text-right">Quantity</th>
                      <th className="py-2 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editedParts.length > 0 ? editedParts.map((p, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2">{p.name}</td>
                        <td className="py-2">{p.category}</td>
                        <td className="py-2 text-right">{p.recommendedQuantity ?? p.recommendedQty ?? '–'}</td>
                        <td className="py-2 text-right">
                          {isEditingParts ? (
                            <div className="flex items-center justify-end gap-2">
                              <input type="number" min={0} value={Number(p.quantity || 0)} onChange={(e) => {
                                const val = Number(e.target.value || 0);
                                const newParts = [...editedParts];
                                newParts[i].quantity = val;
                                setEditedParts(newParts);
                              }} className="w-20 text-right border rounded px-2 py-1" />
                              <button onClick={async () => {
                                try {
                                  setUpdating(true);
                                  if (!id) throw new Error('Missing claim id');
                                  const payload = [{ id: p.id ?? p.partId, quantity: Number(p.quantity) }];
                                  if (!payload[0].id) {
                                    toast.error('Part id không hợp lệ!');
                                    setUpdating(false);
                                    return;
                                  }
                                  await axios.put(`/api/api/${id}/parts/quantity`, payload, { headers: { 'Content-Type': 'application/json' } });
                                  toast.success('Part updated');
                                  const res = await axios.get(`/api/api/claims/${id}`);
                                  setClaimDetail(res.data.data);
                                  setEditedParts(res.data.data.partCLiam || []);
                                } catch (err) {
                                  console.error('Failed to update part:', err);
                                  toast.error('Failed to update part');
                                } finally { setUpdating(false); }
                              }} disabled={updating} className="px-2 py-1 bg-green-500 text-white rounded" title="Update this part">
                                ✓
                              </button>
                            </div>
                          ) : (
                            <span>{p.quantity}</span>
                          )}
                        </td>
                        <td className="py-2 text-right">{p.remainingStock ?? '–'}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="py-6 text-center text-gray-500">No parts have been added yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "technicians" && (
          <>
            {/* SC_STAFF: Show technician card if assigned */}
            {currentUser?.role === "SC_STAFF" && hasAssignedTechnician && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Technician Management</h3>
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-8 flex flex-col gap-6" style={{ boxShadow: '0 0 0 1px #c7e0ff' }}>
                  <div className="flex items-center gap-6 mb-2">
                    <div className="p-4 bg-blue-600 rounded-lg">
                      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#fff" /><rect x="6" y="14" width="12" height="6" rx="3" fill="#fff" /></svg>
                    </div>
                    <div>
                      <div className="font-bold text-2xl text-gray-900">{assignedTechnicianName}</div>
                      <div className="text-blue-600 font-medium text-lg">Currently Assigned</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 mt-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</div>
                      <div className="text-lg font-bold text-gray-900">Đang hoạt động</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Jobs in Progress</div>
                      <div className="text-lg font-bold text-gray-900">{fcr?.technician?.countJob ?? fcr?.countJob ?? 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* SC_STAFF: Show assignment panel if not assigned */}
            {currentUser?.role === "SC_STAFF" && !hasAssignedTechnician && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold mb-3">Assign Technician</h3>
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-3">
                    <select value={selectedTechnician} onChange={(e) => setSelectedTechnician(e.target.value)} className="border rounded px-3 py-2">
                      <option value="">Select technician...</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>{`${t.name} (${t.countJob ?? 0} job${(t.countJob ?? 0) !== 1 ? 's' : ''})`}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={async () => {
                      if (!selectedTechnician) return toast.error("Please select a technician");
                      try {
                        if (!id) return toast.error("Missing claim id");
                        const tech = technicians.find((t) => String(t.id) === String(selectedTechnician));
                        if (!tech) return toast.error("Selected technician not found");
                        const payload = { technicalName: tech.name };
                        await axios.put(`/api/api/claims/${id}/assign-tech`, payload);
                        toast.success('Assigned');
                        const res = await axios.get(`/api/api/claims/${id}`);
                        setClaimDetail(res.data.data);
                      } catch (err) {
                        console.error(err);
                        toast.error('Failed to assign');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Assign
                  </button>
                </div>
              </div>
            )}

            {/* Technician Work (visible only to technicians) */}
            {currentUser?.role === "TECHNICIAN" && !techViewingDetail && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Technician Work</h3>
                  <div>
                    <button onClick={() => setTechViewingDetail(true)} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded">View Detail</button>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                  <textarea rows={3} value={techDiagnosis} onChange={(e) => setTechDiagnosis(e.target.value)} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                  <input type="file" accept="image/*" multiple onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    if (newFiles.length === 0) return;
                    setTechAttachments((prev) => [...prev, ...newFiles]);
                  }} />

                  {/* Previews */}
                  {techPreviews && techPreviews.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {techPreviews.map((src, i) => (
                        <div key={i} className="relative rounded overflow-hidden border border-gray-200">
                          <img src={src} alt={`preview-${i}`} className="w-full h-28 object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = techAttachments.filter((_, idx) => idx !== i);
                              setTechAttachments(newFiles);
                            }}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const c = e.target.value;
                      setSelectedCategory(c);
                      setSelectedPart(null);
                      fetchParts(c);
                    }}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {selectedCategory && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Part</label>
                    <select
                      value={selectedPart?.id || ""}
                      onChange={(e) => {
                        const id = e.target.value;
                        const list = partsByCategory[selectedCategory] || [];
                        const part = list.find((p) => String(p.id) === String(id) || String(p.partId) === String(id));
                        if (part) {
                          // normalize and set
                          setSelectedPart({
                            ...part,
                            id: part.id ?? part.partId,
                            name: part.name ?? part.partName ?? part.partCode,
                            code: part.code ?? part.partCode,
                          });
                        } else {
                          setSelectedPart(null);
                        }
                      }}
                      className="border rounded px-3 py-2 w-full"
                    >
                      <option value="">Select part...</option>
                      {(partsByCategory[selectedCategory] || []).map((p) => (
                        <option key={p.id ?? p.partId} value={p.id ?? p.partId}>
                          {p.name} ({p.code || p.partCode || '-'})
                        </option>
                      ))}
                    </select>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handleAddPartTech}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Add Part
                      </button>
                    </div>
                  </div>
                )}
                {/* Technician-only selected parts preview */}
                {currentUser?.role === "TECHNICIAN" && techParts.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold">Parts to submit (Technician)</h4>
                      <button onClick={() => setTechParts([])} className="text-sm text-red-600">Clear</button>
                    </div>
                    <ul className="space-y-2">
                      {techParts.map((tp) => (
                        <li key={tp.id} className="flex items-center justify-between gap-3 border rounded p-2">
                          <div>
                            <div className="font-medium">{tp.name}</div>
                            <div className="text-xs text-gray-500">{tp.category} • Qty: {tp.quantity}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleRemoveTechPart(tp.id)} className="text-sm text-red-600 px-2 py-1 border rounded">Remove</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={async () => {
                    if (!techDiagnosis.trim()) return toast.error('Please enter diagnosis');
                    try {
                      if (!id) return toast.error('Missing claim id');
                      setTechUploading(true);
                      const fd = new FormData();
                      // use technician-local parts when submitting work
                      const claimPayload = { diagnosis: techDiagnosis, vin: claimDetail?.fcr?.vin, defectivePartIds: techParts.map((p) => p.id) };
                      fd.append('claim', new Blob([JSON.stringify(claimPayload)], { type: 'application/json' }));
                      techAttachments.forEach((f) => fd.append('attachments', f));
                      console.log('Submitting technician update for claim', id, claimPayload, techAttachments.length, 'attachments');
                      await axios.put(`/api/api/claims/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                      toast.success('Submitted technician update');
                      const refreshed = await axios.get(`/api/api/claims/${id}`);
                      setClaimDetail(refreshed.data.data);
                      // reset only technician-local state; do not alter global editedParts shown in Detail tab
                      setTechDiagnosis('');
                      setTechAttachments([]);
                      setTechParts([]);
                    } catch (err) { console.error(err); toast.error('Failed to submit update'); } finally { setTechUploading(false); }
                  }} disabled={techUploading} className="px-4 py-2 bg-green-600 text-white rounded">{techUploading ? 'Submitting...' : 'Submit Work'}</button>
                  <button onClick={() => { setTechDiagnosis(''); setTechAttachments([]); }} className="px-4 py-2 bg-gray-200 rounded">Reset</button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Modals (render outside main container) */}
      {previewImg && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setPreviewImg(null)}>
          <div className="relative max-w-3xl w-full">
            <img src={previewImg} alt="Preview" className="w-full h-auto rounded-lg shadow-2xl" />
            <button onClick={() => setPreviewImg(null)} className="absolute top-4 right-4 bg-white rounded-full p-2">✕</button>
          </div>
        </div>
      )}

      {showModal && (
        <CreatePartRequestModal onClose={() => setShowModal(false)} onCreated={() => { toast.success('Part supply request created successfully'); setShowModal(false); }} />
      )}

      {showUpdateAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative">
            <button onClick={() => setShowUpdateAllModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"><X size={20} /></button>
            <h2 className="text-xl font-semibold mb-4">Update All Parts</h2>
            <div className="max-h-[400px] overflow-y-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b"><tr><th className="py-2 px-3 text-left">Part Name</th><th className="py-2 px-3 text-center">Category</th><th className="py-2 px-3 text-center">Quantity</th></tr></thead>
                <tbody>{tempParts.map((part, i) => (<tr key={i} className="border-b hover:bg-gray-50"><td className="py-2 px-3">{part.name}</td><td className="py-2 px-3 text-center">{part.category}</td><td className="py-2 px-3 text-center"><input type="number" max={part.recommendedQuantity ?? Infinity} min={0} value={part.quantity} onChange={(e) => { const newParts = [...tempParts]; newParts[i].quantity = Number(e.target.value); setTempParts(newParts); }} className="border rounded px-2 py-1 w-20 text-right" /></td></tr>))}</tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowUpdateAllModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={async () => {
                try {
                  if (!id) return toast.error('Missing claim id');
                  const payload = tempParts.map((p) => ({ id: p.id ?? p.partId, quantity: p.quantity }));
                  if (!payload.every(item => item.id)) {
                    toast.error('Có part id không hợp lệ!');
                    return;
                  }
                  await axios.put(`/api/api/${id}/parts/quantity`, payload, { headers: { 'Content-Type': 'application/json' } });
                  toast.success('All parts updated successfully!');
                  setShowUpdateAllModal(false);
                  const res = await axios.get(`/api/api/claims/${id}`);
                  setClaimDetail(res.data.data); setEditedParts(res.data.data.partCLiam || []);
                } catch (err) { console.error(err); toast.error('Failed to update all parts'); }
              }} className="px-4 py-2 bg-blue-600 text-white rounded">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
    </p>
    <p className="text-base font-medium text-gray-900">{value || "–"}</p>
  </div>
);

export default ClaimDetail;
