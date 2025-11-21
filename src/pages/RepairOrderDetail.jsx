import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Loader,
  AlertCircle,
  UserCog,
  List,
  ArrowLeft,
  CheckCircle,
  Clock,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "../services/axios.customize";
import { useCurrentUser } from "../hooks/useCurrentUser";
import RealBarcodeScanner from "../components/common/RealBarcodeScanner";

const RepairOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const isSCStaff = currentUser?.role === "SC_STAFF";

  const [order, setOrder] = useState(null);
  const [techs, setTechs] = useState([]);
  const [details, setDetails] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTab, setLoadingTab] = useState(false);
  const [activeTab, setActiveTab] = useState("technicians");
  const [selectedTech, setSelectedTech] = useState("");
  const [updating, setUpdating] = useState(false);
  const [currentTech, setCurrentTech] = useState(null);
  const [updatingStepId, setUpdatingStepId] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyData, setVerifyData] = useState({
    signature: "",
    notes: "",
    files: [],
    acceptedResponsibility: false,
  });
  const [verifying, setVerifying] = useState(false);
  const [verifyErrors, setVerifyErrors] = useState({
    signature: "",
    acceptedResponsibility: "",
  });
  const [attachments, setAttachments] = useState([]);
  const [updatingDetailId, setUpdatingDetailId] = useState(null);
  const [repairStarted, setRepairStarted] = useState(false);
  const [startingRepair, setStartingRepair] = useState(false);
  const [inspectionCompleted, setInspectionCompleted] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState([1, 2]);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scanningForDetail, setScanningForDetail] = useState(null);
  const [updatingNewSN, setUpdatingNewSN] = useState(null);

  const toggleExpanded = (idx) => {
    setExpandedSteps((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      return [...prev, idx];
    });
  };

  // Allow changing selected old serial number per detail row
  const handleOldSNChange = (idx, value) => {
    // Store selection in a temporary field so UI doesn't lock until Update is clicked
    setDetails((prev) => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      arr[idx] = { ...(arr[idx] || {}), pendingOldSerialNumber: value };
      return arr;
    });
  };

  // Persist selected old serial number for a specific repair detail
  const handleUpdateOldSNSubmit = async (detailId, idx) => {
    try {
      // Use the pending selection (made by user) — do not rely on oldSerialNumber which may be the saved value
      const value = details?.[idx]?.pendingOldSerialNumber || "";
      if (!value)
        return toast.error("Please select a serial number before updating.");

      setUpdatingDetailId(detailId);
      // Send PUT to update the repair detail's oldSerialNumber (send as JSON)
      await axios.put(`/api/api/repair-details/${detailId}`, {
        oldSerialNumber: value,
      });

      toast.success("Old serial number updated successfully");

      // Mark this detail as saved: set the real oldSerialNumber, clear list and pending selection
      setDetails((prev) => {
        const arr = Array.isArray(prev) ? [...prev] : [];
        arr[idx] = {
          ...(arr[idx] || {}),
          oldSerialNumber: value,
          listOldSerialNumber: [],
          pendingOldSerialNumber: undefined,
        };
        return arr;
      });
    } catch (err) {
      console.error("Failed to update old serial number:", err);
      toast.error("Failed to update old serial number. Please try again.");
    } finally {
      setUpdatingDetailId(null);
    }
  };

  const handleBarcodeScanned = async (barcode) => {
    if (!scanningForDetail) return;

    try {
      setUpdatingNewSN(scanningForDetail.id);
      await axios.put(`/api/api/repair-details/${scanningForDetail.id}`, {
        newSerialNumber: barcode.trim(),
        installationDate: new Date().toISOString().split("T")[0],
      });

      toast.success(`New serial number updated: ${barcode}`);
      await fetchDetails();

      const channel = new BroadcastChannel("repair_order_updates");
      channel.postMessage({ type: "DETAIL_UPDATED", id });
      channel.close();
    } catch (err) {
      console.error("Failed to update new serial number:", err);
      toast.error("Failed to update serial number");
    } finally {
      setUpdatingNewSN(null);
      setShowBarcodeScanner(false);
      setScanningForDetail(null);
    }
  };

  const openScanner = (detail) => {
    setScanningForDetail(detail);
    setShowBarcodeScanner(true);
  };

  const closeScanner = () => {
    setShowBarcodeScanner(false);
    setScanningForDetail(null);
  };

  const handleVerifySubmit = async () => {
    let hasError = false;
    const errors = { signature: "", acceptedResponsibility: "" };

    if (!verifyData.signature?.trim()) {
      errors.signature = "Signature is required";
      hasError = true;
    }

    if (!verifyData.acceptedResponsibility) {
      errors.acceptedResponsibility =
        "You must confirm the repair is completed correctly";
      hasError = true;
    }

    setVerifyErrors(errors);
    if (hasError) return;

    try {
      setVerifying(true);
      const fd = new FormData();
      const verifyObj = {
        signature: verifyData.signature,
        notes: verifyData.notes,
        acceptedResponsibility: verifyData.acceptedResponsibility,
      };
      fd.append(
        "verify",
        new Blob([JSON.stringify(verifyObj)], { type: "application/json" })
      );
      attachments.forEach((file) => fd.append("attachments", file));

      await axios.post(`/api/api/${id}/verify`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Repair order verified successfully!");
      setShowVerifyModal(false);
      await fetchOrderAndTechs();
    } catch (err) {
      console.error("Verification failed:", err);
      toast.error("Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  // Fetch both order info and technician list
  const fetchOrderAndTechs = async () => {
    try {
      const res = await axios.get(`/api/api/repair-orders/${id}`);
      const data = res.data?.data;

      // Nếu không có dữ liệu hoặc trả về null → hiển thị thông báo
      if (!data || !data.filterOrderResponse) {
        setOrder(null);
        toast.error("Repair Order not found. Please check the ID.");
        return;
      }

      setOrder({
        ...data.filterOrderResponse,
        verifiedBy: data.verifiedBy,
        verifiedAt: data.verifiedAt,
        notes: data.notes,
        acceptedResponsibility: data.acceptedResponsibility,
        signature: data.signature,
        attachmentPaths: data.attachmentPaths || [],
      });

      setTechs(data.getTechnicalsResponse?.technicians || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      if (
        err.response?.status === 404 ||
        err.response?.data?.errorCode === "Repair order not found"
      ) {
        setOrder(null);
        toast.error("Repair Order not found. Please check the ID.");
      } else {
        toast.error(
          "Failed to load Repair Order data. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async () => {
    try {
      setLoadingTab(true);
      const res = await axios.get(`/api/api/repair-details/${id}`);
      setDetails(res.data?.data?.repairDetails || []);
    } catch (err) {
      console.error("Failed to fetch repair details:", err);
    } finally {
      setLoadingTab(false);
    }
  };

  // Fetch repair steps
  const fetchSteps = async () => {
    try {
      setLoadingTab(true);
      const res = await axios.get(`/api/api/repair-steps/${id}`);
      const stepsData = res.data?.data || [];
      setSteps(stepsData);

      // If Step 2 (index 1) is completed, auto-expand Step 3 (index 2) so details appear
      if (Array.isArray(stepsData) && stepsData.length > 2) {
        const step2 = stepsData[1];
        if (step2 && step2.status === "COMPLETED") {
          setExpandedSteps((prev) => (prev.includes(2) ? prev : [...prev, 2]));
        }
      }

      // Check if any step with title "Inspection" is COMPLETED
      const inspectionStep = stepsData.find(
        (s) => s.title && s.title.toLowerCase().includes("inspection")
      );
      if (inspectionStep && inspectionStep.status === "COMPLETED") {
        setInspectionCompleted(true);
      } else {
        setInspectionCompleted(false);
      }
    } catch (err) {
      console.error("Failed to fetch repair steps:", err);
    } finally {
      setLoadingTab(false);
    }
  };

  // Update repair steps
  const handleUpdateStatus = async (stepId, newStatus) => {
    try {
      setUpdatingStepId(stepId);
      await axios.patch(`/api/api/repair-steps/${stepId}`, {
        status: newStatus,
      });
      toast.success("Status update successful");
      // fetchDetails();
      await Promise.all([fetchSteps(), fetchOrderAndTechs()]);
      const channel = new BroadcastChannel("repair_order_updates");
      channel.postMessage({ type: "ORDER_UPDATED", id });
      channel.close();
    } catch (err) {
      console.error(err);
      toast.error("Update status failed");
    } finally {
      setUpdatingStepId(null);
    }
  };

  // Start repair order
  const handleStartRepair = async () => {
    try {
      setStartingRepair(true);
      const res = await axios.post(`/api/api/repair-steps/${id}/start`);
      toast.success(res.data?.data || "Repair order started successfully!");
      setRepairStarted(true);
      // Fetch steps to show them
      await fetchSteps();
    } catch (err) {
      console.error("Failed to start repair order:", err);
      toast.error(
        err.response?.data?.message || "Failed to start repair order."
      );
    } finally {
      setStartingRepair(false);
    }
  };

  // Assign or reassign technician
  const handleAssignTech = async () => {
    if (!selectedTech) return toast.error("Please select a technician");
    try {
      setUpdating(true);
      await axios.put(`/api/api/repair-orders/${id}`, {
        technicalName: selectedTech,
      });
      console.log(" Assigned technician:", selectedTech);
      toast.success("Technician updated successfully!");
      await fetchOrderAndTechs();
      setSelectedTech("");

      const channel = new BroadcastChannel("repair_order_updates");
      channel.postMessage({ type: "ORDER_UPDATED", id });
      channel.close();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update technician.");
    } finally {
      setUpdating(false);
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setAttachments([...attachments, ...newFiles]);
  };

  const handleRemoveImage = (index) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const renderStep2Table = (data) => {
    if (!data || data.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">
                #
              </th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">
                Part
              </th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">
                Old SN
              </th>
              <th className="px-1 py-1 text-center font-semibold text-gray-700">
                Qty
              </th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">
                License
              </th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">
                Category
              </th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">
                Replacement
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50">
                <td className="px-1 py-1 text-gray-700">{index + 1}</td>
                <td className="px-1 py-1 text-gray-700">{item.partName}</td>
                <td className="px-1 py-1 text-gray-700 break-words">
                  {Array.isArray(item.listOldSerialNumber) &&
                    item.listOldSerialNumber.length > 0 &&
                    (!item.oldSerialNumber || item.oldSerialNumber === "N/A") ? (
                    <div className="flex items-center gap-1">
                      <select
                        value={item.pendingOldSerialNumber || ""}
                        onChange={(e) =>
                          handleOldSNChange(index, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-1 py-0.5 border border-gray-300 rounded text-xs bg-white"
                      >
                        <option value="">Select</option>
                        {(() => {
                          const used = (Array.isArray(details) ? details : [])
                            .map(
                              (d) =>
                                d?.pendingOldSerialNumber || d?.oldSerialNumber
                            )
                            .filter(Boolean);
                          return item.listOldSerialNumber
                            .filter((sn) => {
                              const own =
                                item.pendingOldSerialNumber ||
                                item.oldSerialNumber ||
                                null;
                              return sn === own || !used.includes(sn);
                            })
                            .map((sn) => (
                              <option key={sn} value={sn}>
                                {sn}
                              </option>
                            ));
                        })()}
                      </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateOldSNSubmit(item.id, index);
                        }}
                        disabled={updatingDetailId === item.id}
                        className={`px-1.5 py-0.5 text-xs rounded font-medium whitespace-nowrap ${updatingDetailId === item.id
                          ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                      >
                        {updatingDetailId === item.id ? (
                          <Loader className="h-3 w-3 animate-spin" />
                        ) : (
                          "✓"
                        )}
                      </button>
                    </div>
                  ) : (
                    <span
                      className={
                        item.oldSerialNumber && item.oldSerialNumber !== "N/A"
                          ? "font-semibold text-green-700 text-xs"
                          : "text-gray-500"
                      }
                    >
                      {item.oldSerialNumber || "—"}
                    </span>
                  )}
                </td>
                <td className="px-1 py-1 text-center text-gray-700">
                  {item.quantity}
                </td>
                <td className="px-1 py-1 text-gray-700 text-xs">
                  {item.licensePlate}
                </td>
                <td className="px-1 py-1 text-gray-700 text-xs">
                  {item.category}
                </td>
                <td className="px-1 py-1 text-gray-700 text-xs">
                  {item.replacementDescription || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderStep3Table = (data) => {
    if (!data || data.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">
                Part
              </th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">
                Old SN
              </th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">
                New SN
              </th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">
                Date
              </th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50">
                <td className="px-1 py-1 text-gray-700 font-medium">
                  {item.partName}
                </td>
                <td className="px-1 py-1 text-gray-700 text-xs break-words">
                  {/* FIX: Chỉ hiển thị oldSerialNumber đã được lưu */}
                  {item.oldSerialNumber && item.oldSerialNumber !== "N/A" ? (
                    <span className="font-semibold text-green-700">
                      {item.oldSerialNumber}
                    </span>
                  ) : (
                    <span className="text-red-500">Not selected</span>
                  )}
                </td>
                <td className="px-1 py-1 text-gray-700 text-xs break-words">
                  {item.newSerialNumber ? (
                    <span className="font-semibold text-blue-700">
                      {item.newSerialNumber}
                    </span>
                  ) : (
                    <span className="text-gray-400">Not scanned</span>
                  )}
                </td>
                <td className="px-1 py-1 text-gray-700 text-xs">
                  {item.installationDate
                    ? `${item.installationDate[2]}/${item.installationDate[1]}`
                    : "—"}
                </td>
                <td className="px-1 py-1">
                  {!item.newSerialNumber ? (
                    <button
                      onClick={() => openScanner(item)}
                      disabled={
                        updatingNewSN === item.id ||
                        !item.oldSerialNumber ||
                        item.oldSerialNumber === "N/A"
                      }
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${updatingNewSN === item.id ||
                        !item.oldSerialNumber ||
                        item.oldSerialNumber === "N/A"
                        ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                      {updatingNewSN === item.id ? (
                        <Loader className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Camera size={12} />
                          Scan
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => openScanner(item)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-orange-600 text-white hover:bg-orange-700 transition"
                    >
                      <Camera size={12} />
                      Rescan
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSteps = (data, repairDetails = []) => {
    if (loadingTab)
      return (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      );

    if (!data || data.length === 0)
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No steps available</p>
        </div>
      );

    return (
      <div className="space-y-2">
        {data.map((step, stepIndex) => (
          <div key={step.stepId}>
            <div
              onClick={() => toggleExpanded(stepIndex)}
              className="border border-gray-200 bg-white rounded-lg p-2 hover:shadow-sm transition"
              style={{ cursor: "pointer" }}
            >
              <div className="flex justify-between items-start gap-3">
                {/* Left: Step Title + Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {step.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${step.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : step.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-700"
                          : step.status === "WAITING"
                            ? "bg-purple-100 text-purple-700"
                            : step.status === "CANCELLED"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                        }`}
                    >
                      {step.status}
                    </span>
                  </div>

                  {/* Estimated / Actual hours (display under title) */}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Estimated:</span>
                      <span className="font-medium text-gray-900">
                        {step.estimatedHour ?? "-"}h
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Actual:</span>
                      <span className="font-medium text-gray-900">
                        {step.actualHour ?? "-"}h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status Buttons */}
                {!isSCStaff &&
                  currentTech &&
                  !["COMPLETED", "CANCELLED"].includes(step.status) &&
                  (() => {
                    const title = (step.title || "").toLowerCase();
                    const isRepairReplaceStep =
                      title.includes("repair") &&
                      title.includes("replace") &&
                      title.includes("part");
                    const missingOldSN = Array.isArray(repairDetails)
                      ? repairDetails.some(
                        (d) =>
                          !d.oldSerialNumber || d.oldSerialNumber === "N/A"
                      )
                      : true;

                    return (
                      <div className="flex items-center gap-2">
                        {step.nextStatuses.map((status) => {
                          const isActive = step.status === status;
                          const isCompleteAction = status === "COMPLETED";
                          const disableComplete =
                            isRepairReplaceStep &&
                            missingOldSN &&
                            isCompleteAction;
                          const disabled =
                            updatingStepId === step.stepId || disableComplete;

                          return (
                            <div key={status} className="relative group">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!disabled)
                                    handleUpdateStatus(step.stepId, status);
                                }}
                                disabled={disabled}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition border-2 text-xs ${isActive
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : disabled
                                    ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-white border-gray-300 hover:border-blue-600"
                                  }`}
                              >
                                {isActive && <CheckCircle size={16} />}
                              </button>
                              <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                                {disableComplete
                                  ? `${status} (update Old SN first)`
                                  : status}
                              </div>
                            </div>
                          );
                        })}
                        {updatingStepId === step.stepId && (
                          <Loader className="animate-spin h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    );
                  })()}
              </div>

              {/* Warning banner for Repair/Replace step */}
              {(() => {
                const title = (step.title || "").toLowerCase();
                const isRepairReplaceStep =
                  title.includes("repair") &&
                  title.includes("replace") &&
                  title.includes("part");
                const missingOldSN = Array.isArray(repairDetails)
                  ? repairDetails.some(
                    (d) => !d.oldSerialNumber || d.oldSerialNumber === "N/A"
                  )
                  : false;
                return isRepairReplaceStep && missingOldSN ? (
                  <div className="mt-2 p-2 text-xs bg-yellow-50 border border-yellow-300 rounded text-yellow-800">
                    Please select Old SN for all parts before marking as
                    Completed.
                  </div>
                ) : null;
              })()}
            </div>

            {/* Compact Repair Details */}
            {/* Show Step 2 details even before the step is completed so technicians can select Old SN */}
            {stepIndex === 1 &&
              repairDetails.length > 0 &&
              expandedSteps.includes(stepIndex) && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-300 rounded-lg">
                  {renderStep2Table(repairDetails)}
                </div>
              )}
            {step.status === "COMPLETED" &&
              stepIndex === 2 &&
              repairDetails.length > 0 &&
              expandedSteps.includes(stepIndex) && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera size={16} className="text-blue-600" />
                    <h4 className="font-semibold text-blue-900 text-sm">
                      Part Installation - Scan New Serial Numbers
                    </h4>
                  </div>
                  {renderStep3Table(repairDetails)}
                  <p className="text-xs text-blue-700 mt-2">
                    Use the Scan button to capture new serial numbers for each
                    installed part.
                  </p>
                </div>
              )}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    fetchOrderAndTechs();
  }, [id]);

  useEffect(() => {
    if (order && techs.length > 0 && order.techinal) {
      const tech = techs.find((t) => t.name === order.techinal);
      setCurrentTech(tech || null);
    }
  }, [order, techs]);

  useEffect(() => {
    if (activeTab === "steps" && steps.length === 0) {
      fetchSteps();
      if (details.length === 0) fetchDetails();
    }
  }, [activeTab]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading repair order...</p>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:underline text-blue-600">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link to="/repair-orders" className="hover:underline text-blue-600">
            Repair Orders
          </Link>
          <span className="mx-1">/</span>
          <Link className="text-gray-700 font-medium">Repair Detail</Link>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition"
        >
          <ArrowLeft size={18} />
          Back to Repair Orders
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Repair Order Details
          </h1>
          <p className="text-gray-600 mt-1">
            Order ID:{" "}
            <span className="font-semibold text-gray-900">
              RO-{String(order?.repairOrderId || id).padStart(4, "0")}
            </span>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <QuickStat
            label="Status"
            value={order.claimStatus}
            icon={<CheckCircle className="text-blue-600" size={20} />}
            bg="bg-blue-100"
          />
          <QuickStat
            label="Progress"
            value={`${order.percentInProcess || 0}%`}
            icon={<Clock className="text-green-600" size={20} />}
            bg="bg-green-100"
          />
          <QuickStat
            label="Technician"
            value={order.techinal || "Unassigned"}
            icon={<User className="text-purple-600" size={20} />}
            bg="bg-purple-100"
          />
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Order Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem label="Model Name" value={order.modelName} />
            <InfoItem label="VIN" value={order.vin} mono />
            <InfoItem label="Production Year" value={order.prodcutYear} />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">
                Repair Progress
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {order.percentInProcess || 0}%
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
                  order.percentInProcess
                )}`}
                style={{ width: `${order.percentInProcess || 0}%` }}
              />
            </div>

            {order.percentInProcess === 100 && (
              <div className="mt-5 text-center">
                {order.claimStatus === "COMPLETED" ? (
                  <div className="bg-green-50 border border-green-300 rounded-lg p-5 max-w-md mx-auto">
                    <h3 className="text-green-700 font-semibold text-lg mb-3">
                      Tested and confirmed complete
                    </h3>
                    <p className="text-sm text-gray-700">
                      Confirmer:{" "}
                      <span className="font-semibold">
                        {order.verifiedBy || "-"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Signature:{" "}
                      <span className="font-semibold">
                        {order.signature || "-"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Confirmation time:{" "}
                      <span className="font-semibold">
                        {order.verifiedAt
                          ? `${order.verifiedAt[2]}/${order.verifiedAt[1]}/${order.verifiedAt[0]
                          } ${order.verifiedAt[3]}:${String(
                            order.verifiedAt[4]
                          ).padStart(2, "0")}`
                          : "–"}
                      </span>
                    </p>
                    {order.notes && (
                      <p className="text-sm text-gray-700 mt-2 italic">
                        Note: "{order.notes}"
                      </p>
                    )}
                    {order.attachmentPaths &&
                      order.attachmentPaths.length > 0 && (
                        <RepairOrderAttachments
                          attachments={order.attachmentPaths}
                        />
                      )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    className={`px-5 py-2 rounded-lg text-white font-medium ${isSCStaff
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                      }`}
                  >
                    Confirmation completed
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Start Repair Card */}
        {!isSCStaff && !repairStarted && order.percentInProcess === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-green-300 p-8 mb-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Ready to Start Repair
                </h3>
                <p className="text-gray-600 mb-4">
                  Click the button below to begin the repair process and access
                  all repair steps.
                </p>
              </div>
              <button
                onClick={handleStartRepair}
                disabled={startingRepair}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition shadow-lg"
              >
                {startingRepair ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <span>▶</span>
                    Start Repair Process
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              {
                key: "technicians",
                label: "Technicians",
                icon: <UserCog size={18} />,
              },
              { key: "steps", label: "Repair Steps", icon: <List size={18} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition ${activeTab === tab.key
                  ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "technicians" ? (
              <TechnicianTab
                currentTech={currentTech}
                techs={techs}
                selectedTech={selectedTech}
                setSelectedTech={setSelectedTech}
                handleAssignTech={handleAssignTech}
                updating={updating}
              />
            ) : (
              <>
                {order.percentInProcess === 0 && !repairStarted && (
                  <div className="mb-4 p-3 rounded-lg bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 text-sm font-medium">
                    Click the "Start" button to begin the repair process and see
                    repair steps.
                  </div>
                )}
                {isSCStaff && repairStarted && (
                  <div className="mb-4 p-3 rounded-lg bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 text-sm font-medium">
                    Only technicians can update the repair progress in the
                    steps.
                  </div>
                )}
                {order.percentInProcess > 0 || repairStarted ? (
                  renderSteps(steps, details)
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">
                      Click the "Start" button to begin the repair process
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && scanningForDetail && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Scan Barcode - {scanningForDetail.partName}
              </h3>
              <button
                onClick={closeScanner}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto">
              <RealBarcodeScanner
                onScan={handleBarcodeScanned}
                onClose={closeScanner}
                partName={scanningForDetail.partName}
              />
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Confirm repair completion
            </h2>

            <div className="space-y-4">
              {/* Chữ ký */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full name (confirmation signature){" "}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={verifyData.signature}
                  onChange={(e) =>
                    setVerifyData((prev) => ({
                      ...prev,
                      signature: e.target.value,
                    }))
                  }
                  className={`w-full border rounded-lg p-2 focus:ring-2 focus:outline-none
      ${verifyErrors.signature ? "border-red-600" : "border-gray-300"} 
      focus:border-blue-500 focus:ring-blue-500`}
                  placeholder="Enter the name of the person confirming..."
                />
                {verifyErrors.signature && (
                  <p className="text-red-600 text-sm mt-1">
                    {verifyErrors.signature}
                  </p>
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  value={verifyData.notes}
                  onChange={(e) =>
                    setVerifyData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter notes (if any)..."
                ></textarea>
              </div>

              {/* Upload file */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Choose Files
                  </label>
                  <p className="text-gray-500 text-sm mt-1">
                    or drag and drop images here
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {attachments.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-gray-200"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition"
                        >
                          <div className="bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                            <X size={16} />
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checkbox xác nhận */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={verifyData.acceptedResponsibility}
                  onChange={(e) =>
                    setVerifyData((prev) => ({
                      ...prev,
                      acceptedResponsibility: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm text-gray-700 font-bold">
                  I confirm that the repair process has been completed correctly{" "}
                  <span className="text-red-600">*</span>
                </span>
              </div>
              {verifyErrors.acceptedResponsibility && (
                <p className="text-red-600 text-sm mt-1">
                  {verifyErrors.acceptedResponsibility}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifySubmit}
                disabled={verifying}
                className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {verifying ? "Confirming..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub components
const QuickStat = ({ label, value, icon, bg }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const InfoItem = ({ label, value, mono = false }) => (
  <div>
    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
      {label}
    </p>
    <p
      className={`text-base font-semibold text-gray-900 ${mono ? "font-mono bg-gray-100 px-2 py-1 rounded inline-block" : ""
        }`}
    >
      {value || "–"}
    </p>
  </div>
);

const TechnicianTab = ({
  currentTech,
  techs,
  selectedTech,
  setSelectedTech,
  handleAssignTech,
  updating,
}) => (
  <div>
    <h3 className="text-lg font-bold text-gray-900 mb-6">
      Technician Management
    </h3>

    {/* Current technician */}
    {currentTech ? (
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 bg-blue-600 rounded-lg">
            <User className="text-white" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xl">
              {currentTech.name}
            </h4>
            <p className="text-sm font-semibold text-blue-700">
              Currently Assigned
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="Status" value={currentTech.message} />
          <InfoItem label="Jobs in Progress" value={currentTech.countJob} />
        </div>
      </div>
    ) : (
      <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50 text-center">
        <User className="text-gray-300 mx-auto mb-3" size={32} />
        <p className="text-gray-500 font-medium">No technician assigned yet</p>
      </div>
    )}

    {/* Assign technician */}
    {!currentTech && (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Assign Technician</h4>
        <div className="flex gap-3">
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="">Select technician...</option>
            {techs.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name} - {t.message} ({t.countJob} jobs)
              </option>
            ))}
          </select>

          <button
            onClick={handleAssignTech}
            disabled={updating || !selectedTech}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {updating ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              "Assign"
            )}
          </button>
        </div>
      </div>
    )}
  </div>
);

const RepairOrderAttachments = ({ attachments }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!attachments || attachments.length === 0) return null;

  return (
    <>
      {/* Ảnh hiển thị duy nhất (ảnh đầu tiên) */}
      <div className="flex justify-center mt-4">
        <div
          className="relative border rounded-lg overflow-hidden shadow hover:shadow-lg transition hover:scale-105 cursor-pointer max-w-sm"
          onClick={() => setLightboxIndex(0)}
        >
          <img
            src={attachments[0].image}
            alt="Attachment preview"
            className="w-full h-40 object-cover"
          />
          {attachments.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              +{attachments.length - 1} more
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-full max-h-full">
            {/* Close button nằm trên ảnh với nền trắng */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-2 right-2 text-black bg-white rounded-full p-2 shadow hover:bg-gray-200 transition z-10"
            >
              <X size={24} />
            </button>

            {/* Prev button */}
            {attachments.length > 1 && (
              <button
                onClick={() =>
                  setLightboxIndex(
                    (lightboxIndex - 1 + attachments.length) %
                    attachments.length
                  )
                }
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition z-10"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {/* Next button */}
            {attachments.length > 1 && (
              <button
                onClick={() =>
                  setLightboxIndex((lightboxIndex + 1) % attachments.length)
                }
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition z-10"
              >
                <ChevronRight size={32} />
              </button>
            )}

            {/* Image */}
            <img
              src={attachments[lightboxIndex].image}
              alt={`Attachment ${lightboxIndex + 1}`}
              className="max-h-screen max-w-screen rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default RepairOrderDetail;