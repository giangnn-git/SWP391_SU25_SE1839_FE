// Warranty Claim Detail page
// Purpose: display claim information, images, parts and technician workflow.
// Major responsibilities:
//  - Load claim data (claimDetail) and related lists (technicians, categories)
//  - Provide Detail tab UI for viewing/updating status and claim-wide parts
//  - Provide Technician tab UI for technicians to submit diagnosis, attachments and local parts
//  - Keep API interaction at page level; UI controls update local state and call endpoints
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
  // -----------------------------
  // Overview & grouped state
  // -----------------------------
  // Top-level data: `claimDetail` stores the canonical claim object returned
  // from the server. Whenever we need to show the most up-to-date information
  // we re-fetch and overwrite this state.
  const [claimDetail, setClaimDetail] = useState(null);

  // UI: which tab is active. We default to 'technicians' but some role-based
  // logic will force 'detail' to avoid duplicate tech submissions.
  const [activeTab, setActiveTab] = useState("technicians");

  // Loading & helpers for visual feedback
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Generic modals and transient UI
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

  const isPending = selectedStatus === "PENDING";

  // Helper: normalize parts coming from backend into a predictable shape
  // Ensures each part has `id` and numeric `quantity` fields so downstream
  // logic (like showPending) can rely on stable keys.
  const normalizePartsArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((p) => {
      const id = p?.id ?? p?.partId ?? p?.partID ?? p?.part_id ?? null;
      const quantity = Number(p?.quantity ?? p?.qty ?? p?.amount ?? p?.requestedQuantity ?? p?.requestedQty ?? 0);
      const recommendedQuantity = p?.recommendedQuantity ?? p?.recommendedQty ?? p?.recommendQty ?? undefined;
      // Normalize incoming status for each part. Backend may return different keys.
      const partClaimStatus = p?.partClaimStatus ?? p?.partStatus ?? p?.status ?? p?.claimPartStatus ?? null;
      return { ...p, id, quantity: isNaN(quantity) ? 0 : quantity, recommendedQuantity, partClaimStatus };
    });
  };

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

  // If a TECHNICIAN has already added parts (editedParts non-empty), hide the
  // 'Technicians' tab and switch to the Detail tab to avoid duplicate entries.
  useEffect(() => {
    const isTech = currentUser?.role === "TECHNICIAN";
    const hasParts = Array.isArray(editedParts) && editedParts.length > 0;
    if (isTech && hasParts) {
      setActiveTab("detail");
    }
  }, [editedParts, currentUser]);

  // Fetch claim detail
  // This is the primary data loader for the page. It populates:
  //  - `claimDetail`: canonical server data for the claim
  //  - `technicians`: a list carried in the response used for assignment and matching
  //  - `selectedStatus`: current status used by the status control
  //  - `editedParts`: claim-scoped parts (may be empty)
  // We deliberately re-fetch the claim after important writes so the UI stays
  // consistent with the server rather than trying to keep complex optimistic state.
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
        // normalize parts into predictable shape
        setEditedParts(normalizePartsArray(data.partCLiam ?? data.partClaim ?? data.partList ?? []));
      } catch (err) {
        console.error("Failed to fetch claim detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // NOTE: fetchDetail is the primary data loader for the page and also primes
  // the `technicians`, `selectedStatus` and `editedParts` state used by the UI.

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
  // Called lazily when a category is selected. Results are cached in
  // `partsByCategory` to avoid repeat requests for the same category.
  // The function normalizes incoming part objects so the rest of the UI
  // can rely on `id`, `partId`, `name`, and `code` fields consistently.
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

  // fetchParts: called when user selects a category. Results cached in `partsByCategory`.
  // Normalizes varying backend shapes (id/partId, name/partName) for consistent usage.

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedPart(null);
    fetchParts(category);
  };

  // Add a selected part into the claim-level `editedParts` list.
  // If the part already exists we increment its quantity; otherwise we append it.
  // Quantities are normalized to numbers here.
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
    setPartQuantity("0");
  };

  // handleAddPartTech: add a part to the technician-local list (`techParts`).
  // This is separate from `editedParts` which represents claim-level parts.

  // handleAddPart: merge or append the selected part into `editedParts` (claim-wide).
  // Quantities are converted to numbers; UI resets selection after adding.

  // Add part only to the technician's temporary list (shown on Technician tab only)
  // This does NOT modify `editedParts`. `techParts` are local to the technician
  // session and will only be sent to the server when the technician clicks
  // "Submit Work" (they are included as `defectivePartIds` in the multipart payload).
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
    setPartQuantity("0");
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

  // Create object URLs for local-file previews and revoke them on cleanup.

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

  // fetchCategories: populate category dropdown used by technician/parts UI.

  // handleUpdate: send status and/or parts update for the claim.
  // - REJECTED requires a non-empty `reason`.
  // - ASSIGNED/PENDING path is handled by immediate-change logic in the select handler.
  // - For other statuses we include the `parts` payload built from `editedParts`.
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

      // For ASSIGNED/PENDING we use a dedicated helper that sends
      // { changeStatus } via PATCH and refreshes local state.
      if (selectedStatus === "ASSIGNED" || selectedStatus === "PENDING") {
        await changeClaimStatus(selectedStatus);
        return;
      }

      let payload;
      if (selectedStatus === "REJECTED") {
        payload = { changeStatus: selectedStatus, reason: reason.trim() };
      } else {
        payload = {
          changeStatus: selectedStatus,
          parts: editedParts.map((p) => ({
            id: p.id,
            quantity: Number(p.quantity),
          })),
        };
      }

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
      setEditedParts(normalizePartsArray(updatedData.partCLiam ?? updatedData.partClaim ?? updatedData.partList ?? []));
      setReason("");
      setIsEditingParts(false);
    } catch (err) {
      console.error("Failed to update claim:", err);
      toast.error("Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  // changeClaimStatus: helper to call PATCH /claims/{id} with { changeStatus }
  // Refreshes claimDetail and editedParts from server on success.
  const changeClaimStatus = async (newStatus) => {
    if (!id) return toast.error("Missing claim id");
    try {
      setUpdating(true);
      const payload = { changeStatus: newStatus };
      const res = await axios.patch(`/api/api/claims/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success(res.data?.message || "Change status claim successfully");

      // Some backends may return the updated claim, others may only return a
      // message. To be robust, always re-fetch the canonical claim after a
      // successful status change so the UI stays in sync (avoids needing F5).
      try {
        const fetchRes = await axios.get(`/api/api/claims/${id}`);
        const fetched = fetchRes.data?.data;
        if (fetched) {
          setClaimDetail(fetched);
          setSelectedStatus(fetched.fcr?.currentStatus || "");
          setEditedParts(normalizePartsArray(fetched.partCLiam ?? fetched.partClaim ?? fetched.partList ?? []));
        }
      } catch (fetchErr) {
        console.warn('Status changed but failed to re-fetch claim:', fetchErr);
      }
      try {
        const channel = new BroadcastChannel("claim_updates");
        channel.postMessage({ type: "CLAIM_UPDATED", id });
        channel.close();
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error("Failed to change claim status:", err);
      toast.error("Failed to change status");
    } finally {
      setUpdating(false);
    }
  };

  // handleSaveParts: persist the current `editedParts` to the backend (part-claims endpoint)
  // Called when user saves bulk part changes from the Update Parts modal or UI.
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
      setEditedParts(normalizePartsArray(res.data.data.partCLiam ?? res.data.data.partClaim ?? res.data.data.partList ?? []));
      setIsEditingParts(false);
    } catch (err) {
      console.error("Failed to save parts:", err);
      toast.error("Failed to save parts");
    } finally {
      setUpdating(false);
    }
  };

  // Helper: formatDateTime
  // Input: [year, month, day] or other arrays used by the backend for dates.
  // Output: DD/MM/YYYY or '–' when data is missing.
  const formatDateTime = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length < 3) return "–";
    const [year, month, day] = dateArray;
    return `${String(day).padStart(2, "0")}/${String(month).padStart(
      2,
      "0"
    )}/${year}`;
  };

  // handleUpdatePartQuantity: update a single part quantity via API and refresh claim
  // Expects a non-negative numeric quantity and a valid part id.
  // Note: some UI controls call the PUT endpoint with a single object,
  // while bulk updates send an array. This helper focuses on the per-row case
  // and always re-fetches the claim after a successful write for canonical state.
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
      setEditedParts(normalizePartsArray(refreshed.data.data.partCLiam ?? refreshed.data.data.partClaim ?? refreshed.data.data.partList ?? []));
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
  // Determine status for display: show PENDING only if all claim-level parts
  // have quantity > 0. Be defensive about backend shapes: some responses use
  // `id` vs `partId`, and `quantity` may be a string or stored under different
  // keys. Normalize when checking so the dropdown reliably shows PENDING.
  let showPending = false;
  if (Array.isArray(editedParts) && editedParts.length > 0) {
    // only consider parts that have any identifier (id or partId)
    const hasAnyId = editedParts.some((p) => (p?.id ?? p?.partId) !== undefined);
    if (hasAnyId) {
      showPending = editedParts.every((p) => {
        const qty = Number(p?.quantity ?? p?.qty ?? 0);
        return !Number.isNaN(qty) && qty > 0;
      });
    }
  }

  // Build the statuses list so that we always include the current server
  // status (e.g. ASSIGNED) and additionally include PENDING when
  // `showPending` is true. We also merge availableStatuses but prevent
  // duplicate entries and only include PENDING from availableStatuses when
  // `showPending` is true.
  const statusesSet = new Set();
  if (fcr?.currentStatus) statusesSet.add(fcr.currentStatus);
  if (showPending) statusesSet.add("PENDING");
  (fcr?.availableStatuses || []).forEach((s) => {
    if (s === "PENDING") {
      if (showPending) statusesSet.add(s);
    } else {
      statusesSet.add(s);
    }
  });
  const statuses = Array.from(statusesSet);

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

        {/* Tabs
            - 'Technicians' tab: shows the technician work panel. Hidden for a
              current user with role TECHNICIAN when `editedParts` (claim-wide)
              already exist to prevent duplicate submissions.
            - 'Detail' tab: canonical claim information and the claim-level parts
              table. Many actions (status update, save parts) operate here and
              re-fetch the claim after writes.
        */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            {!(currentUser?.role === "TECHNICIAN" && Array.isArray(editedParts) && editedParts.length > 0) && (
              <button onClick={() => setActiveTab("technicians")} className={`px-4 py-3 -mb-px font-medium ${activeTab === "technicians" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>Technicians</button>
            )}
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
                    {isPending ? (
                      // Read-only khi đã ở trạng thái PENDING
                      <div className="px-3 py-2 border rounded bg-gray-100 text-gray-700 font-semibold min-w-[100px]">
                        Status: {selectedStatus}
                      </div>
                    ) : (
                      // Dropdown bình thường nếu chưa PENDING
                      <select
                        value={selectedStatus || ""}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          setSelectedStatus(newStatus);

                          if (newStatus === "ASSIGNED" || newStatus === "PENDING") {
                            await changeClaimStatus(newStatus);
                          }
                        }}
                        className="border rounded px-3 py-2"
                      >
                        {statuses.map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                      </select>
                    )}

                    {fcr?.currentStatus === "DRAFT" && <button onClick={handleUpdate} disabled={updating} className="px-4 py-2 bg-blue-600 text-white rounded">{updating ? 'Updating...' : 'Update Status'}</button>}
                  </>
                )}
                {/* Edit parts inline */}
                {fcr?.currentStatus === "ASSIGNED" && (
                  currentUser?.role !== "SC_STAFF" && !isEditingParts ? (
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
                      <th className="py-2 text-left">Status</th>
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
                        <td className="py-2">{p.partClaimStatus ?? p.status ?? '–'}</td>
                        <td className="py-2 text-right">{p.recommendedQuantity ?? p.recommendedQty ?? '–'}</td>
                        <td className="py-2 text-right">
                          {isEditingParts ? (
                            <div className="flex items-center justify-end gap-2">
                              <input type="number" min={0} max={p.recommendedQuantity ?? p.recommendedQty ?? undefined} value={Number(p.quantity || 0)} onChange={(e) => {
                                const val = Number(e.target.value || 0);
                                const newParts = [...editedParts];
                                newParts[i].quantity = val;
                                setEditedParts(newParts);
                              }} className="w-20 text-right border rounded px-2 py-1" />
                              {selectedStatus !== "PENDING" && (
                                <button onClick={async () => {
                                  try {
                                    setUpdating(true);
                                    if (!id) throw new Error('Missing claim id');

                                    // Validate only against recommended limit (user requested)
                                    const newQty = Number(p.quantity || 0);
                                    const recommendedLimit = p.recommendedQuantity ?? p.recommendedQty;

                                    if (recommendedLimit !== undefined && newQty > recommendedLimit) {
                                      toast.error('Quantity vượt giới hạn khuyến nghị');
                                      // reset this row quantity to 0 as requested
                                      setEditedParts((prev) => {
                                        const copy = [...prev];
                                        if (copy[i]) copy[i] = { ...copy[i], quantity: 0 };
                                        return copy;
                                      });
                                      setUpdating(false);
                                      return;
                                    }

                                    const payload = [{ id: p.id ?? p.partId, quantity: newQty }];
                                    if (!payload[0].id) {
                                      toast.error('Part id không hợp lệ!');
                                      setUpdating(false);
                                      return;
                                    }
                                    await axios.put(`/api/api/${id}/parts/quantity`, payload, { headers: { 'Content-Type': 'application/json' } });
                                    toast.success('Part updated');

                                    // After updating a single part, refresh the claim to get canonical server state
                                    const res = await axios.get(`/api/api/claims/${id}`);
                                    const updatedData = res.data.data;
                                    setClaimDetail(updatedData);
                                    setEditedParts(normalizePartsArray(updatedData.partCLiam ?? updatedData.partClaim ?? updatedData.partList ?? []));

                                    // Refresh done — update selected status from server.
                                    // NOTE: do NOT auto-change the claim status to PENDING here; the
                                    // PENDING option will be made available in the status dropdown
                                    // when all quantities are positive. The user must select it
                                    // explicitly from the dropdown to change the claim status.
                                    setSelectedStatus(updatedData.fcr?.currentStatus || '');
                                  } catch (err) {
                                    console.error('Failed to update part:', err);
                                    toast.error('Failed to update part');
                                  } finally { setUpdating(false); }
                                }} disabled={updating} className="px-2 py-1 bg-green-500 text-white rounded" title="Update this part">
                                  ✓
                                </button>
                              )}
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
                      <div className="text-lg font-bold text-gray-900">Currently Activity</div>
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
              <div className="bg-white rounded-lg border border-gray-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">Technician Work</h3>
                  <button
                    onClick={() => setTechViewingDetail(true)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                  >
                    View Detail
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Diagnosis */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Diagnosis <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={techDiagnosis}
                      onChange={(e) => setTechDiagnosis(e.target.value)}
                      placeholder="Enter diagnosis..."
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                    />
                  </div>

                  {/* Attachments */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Attachments
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files || []);
                          if (newFiles.length === 0) return;
                          setTechAttachments((prev) => [...prev, ...newFiles]);
                        }}
                        className="hidden"
                        id="tech-file-upload"
                      />
                      <label
                        htmlFor="tech-file-upload"
                        className="flex flex-col items-center justify-center cursor-pointer py-2"
                      >
                        <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600">Click to upload images</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, ...</span>
                      </label>
                    </div>

                    {/* Image Previews */}
                    {techPreviews && techPreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {techPreviews.map((src, i) => (
                          <div key={i} className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-colors">
                            <img src={src} alt={`preview-${i}`} className="w-full h-24 object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = techAttachments.filter((_, idx) => idx !== i);
                                setTechAttachments(newFiles);
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Part Selection */}
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => {
                            const c = e.target.value;
                            setSelectedCategory(c);
                            setSelectedPart(null);
                            fetchParts(c);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                        >
                          <option value="">Select category...</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Part */}
                      {selectedCategory && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Part</label>
                          <select
                            value={selectedPart?.id || ""}
                            onChange={(e) => {
                              const id = e.target.value;
                              const list = partsByCategory[selectedCategory] || [];
                              const part = list.find((p) => String(p.id) === String(id) || String(p.partId) === String(id));
                              if (part) {
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
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                          >
                            <option value="">Select part...</option>
                            {(partsByCategory[selectedCategory] || []).map((p) => (
                              <option key={p.id ?? p.partId} value={p.id ?? p.partId}>
                                {p.name} ({p.code || p.partCode || '-'})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {selectedCategory && (
                      <button
                        type="button"
                        onClick={handleAddPartTech}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                      >
                        Add Part
                      </button>
                    )}
                  </div>

                  {/* Selected Parts List */}
                  {currentUser?.role === "TECHNICIAN" && techParts.length > 0 && (
                    <div className="border border-gray-300 rounded p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          Selected Parts ({techParts.length})
                        </h4>
                        <button
                          onClick={() => setTechParts([])}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Clear All
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {techParts.map((tp) => (
                          <li key={tp.id} className="flex items-center justify-between border border-gray-200 rounded p-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{tp.name}</div>
                              <div className="text-xs text-gray-500">{tp.category}</div>
                            </div>
                            <button
                              onClick={() => handleRemoveTechPart(tp.id)}
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={async () => {
                        if (!techDiagnosis.trim()) return toast.error('Please enter diagnosis');
                        try {
                          if (!id) return toast.error('Missing claim id');
                          setTechUploading(true);
                          const fd = new FormData();
                          const claimPayload = {
                            diagnosis: techDiagnosis,
                            vin: claimDetail?.fcr?.vin,
                            defectivePartIds: techParts.map((p) => p.id)
                          };
                          fd.append('claim', new Blob([JSON.stringify(claimPayload)], { type: 'application/json' }));
                          techAttachments.forEach((f) => fd.append('attachments', f));
                          console.log('Submitting technician update for claim', id, claimPayload, techAttachments.length, 'attachments');
                          await axios.put(`/api/api/claims/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                          toast.success('Submitted technician update');
                          const refreshed = await axios.get(`/api/api/claims/${id}`);
                          setClaimDetail(refreshed.data.data);
                          setEditedParts(normalizePartsArray(refreshed.data.data.partCLiam ?? refreshed.data.data.partClaim ?? refreshed.data.data.partList ?? []));
                          setActiveTab('detail');
                          setTechViewingDetail(false);
                          setTechDiagnosis('');
                          setTechAttachments([]);
                          setTechParts([]);
                        } catch (err) {
                          console.error(err);
                          toast.error('Failed to submit update');
                        } finally {
                          setTechUploading(false);
                        }
                      }}
                      disabled={techUploading}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 disabled:bg-blue-300"
                    >
                      {techUploading ? 'Submitting...' : 'Submit Work'}
                    </button>
                    <button
                      onClick={() => {
                        setTechDiagnosis('');
                        setTechAttachments([]);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                    >
                      Reset
                    </button>
                  </div>
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

      {/* Bulk Update Modal:
          - Copies `editedParts` into `tempParts` before opening so the user can
          - adjust quantities for many parts at once. Validation runs before saving
          - to ensure no quantity exceeds recommended limits.
        */}
      {showUpdateAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative">
            <button onClick={() => setShowUpdateAllModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"><X size={20} /></button>
            <h2 className="text-xl font-semibold mb-4">Update All Parts</h2>
            <div className="max-h-[400px] overflow-y-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b"><tr><th className="py-2 px-3 text-left">Part Name</th><th className="py-2 px-3 text-center">Category</th><th className="py-2 px-3 text-center">Quantity</th></tr></thead>
                <tbody>{tempParts.map((part, i) => (<tr key={i} className="border-b hover:bg-gray-50"><td className="py-2 px-3">{part.name}</td><td className="py-2 px-3 text-center">{part.category}</td><td className="py-2 px-3 text-center"><input type="number" max={part.recommendedQuantity ?? part.recommendedQty ?? undefined} min={0} value={part.quantity} onChange={(e) => { const newParts = [...tempParts]; newParts[i].quantity = Number(e.target.value); setTempParts(newParts); }} className="border rounded px-2 py-1 w-20 text-right" /></td></tr>))}</tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowUpdateAllModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={async () => {
                try {
                  if (!id) return toast.error('Missing claim id');
                  // Validate tempParts: ensure quantity <= recommended when provided
                  const invalid = tempParts.find((p) => {
                    const rec = p.recommendedQuantity ?? p.recommendedQty;
                    return rec !== undefined && Number(p.quantity) > rec;
                  });
                  if (invalid) {
                    toast.error('Một số quantity vượt giới hạn recommended. Vui lòng kiểm tra.');
                    return;
                  }
                  const payload = tempParts.map((p) => ({ id: p.id ?? p.partId, quantity: p.quantity }));
                  if (!payload.every(item => item.id)) {
                    toast.error('Có part id không hợp lệ!');
                    return;
                  }
                  await axios.put(`/api/api/${id}/parts/quantity`, payload, { headers: { 'Content-Type': 'application/json' } });
                  toast.success('All parts updated successfully!');
                  setShowUpdateAllModal(false);
                  // Refresh claim to pick up server state after bulk update
                  const res = await axios.get(`/api/api/claims/${id}`);
                  const updatedData = res.data.data;
                  setClaimDetail(updatedData);
                  setEditedParts(normalizePartsArray(updatedData.partCLiam ?? updatedData.partClaim ?? updatedData.partList ?? []));

                  // Update selectedStatus from server but DO NOT auto-change status to PENDING.
                  // The PENDING option will appear in the dropdown when all quantities
                  // are positive; the user must explicitly choose it.
                  setSelectedStatus(updatedData.fcr?.currentStatus || '');
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
