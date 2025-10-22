import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader, AlertCircle, UserCog, Layers, List, ArrowLeft,
  CheckCircle, Clock, User, Briefcase
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "../services/axios.customize";

const RepairOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  // Fetch both order info and technician list
  const fetchOrderAndTechs = async () => {
    try {
      const res = await axios.get(`/api/api/repairOrders/${id}`);
      const data = res.data?.data || {};
      setOrder(data.filterOrderResponse || {});
      setTechs(data.getTechnicalsResponse?.technicians || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast.error("Failed to load repair order data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch repair details
  const fetchDetails = async () => {
    try {
      setLoadingTab(true);
      const res = await axios.get(`/api/api/repairDetails/${id}`);
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
      const res = await axios.get(`/api/api/repairSteps/${id}`);
      setSteps(res.data?.data?.repairSteps || []);
    } catch (err) {
      console.error("Failed to fetch repair steps:", err);
    } finally {
      setLoadingTab(false);
    }
  };

  // Assign or reassign technician
  const handleAssignTech = async () => {
    if (!selectedTech) return toast.error("Please select a technician");
    try {
      setUpdating(true);
      await axios.put(`/api/api/repairOrders/${id}`, { technicalName: selectedTech });
      toast.success("Technician updated successfully!");
      await fetchOrderAndTechs();
      setSelectedTech("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update technician.");
    } finally {
      setUpdating(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrderAndTechs();
  }, [id]);

  // Set current technician when order + techs loaded
  useEffect(() => {
    if (order && techs.length > 0 && order.techinal) {
      const tech = techs.find((t) => t.name === order.techinal);
      setCurrentTech(tech || null);
    }
  }, [order, techs]);

  // Load detail/step tabs on demand
  useEffect(() => {
    if (activeTab === "details" && details.length === 0) fetchDetails();
    if (activeTab === "steps" && steps.length === 0) fetchSteps();
  }, [activeTab]);

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const renderTable = (data) => {
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
          <p className="text-gray-500 font-medium">No data available</p>
          <p className="text-gray-400 text-sm mt-1">There are no items to display</p>
        </div>
      );

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {Object.keys(data[0]).map((key) => (
                <th key={key} className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, i) => (
              <tr key={i} className="hover:bg-blue-50 transition-colors">
                {Object.values(item).map((val, j) => (
                  <td key={j} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {String(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Repair Order Details</h1>
          <p className="text-gray-600 mt-1">
            Order ID:{" "}
            <span className="font-semibold text-gray-900">
              RO-{String(order.repairOrderId || id).padStart(4, "0")}
            </span>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <QuickStat label="Status" value={order.status ? "Active" : "Inactive"} icon={<CheckCircle className="text-blue-600" size={20} />} bg="bg-blue-100" />
          <QuickStat label="Progress" value={`${order.percentInProcess || 0}%`} icon={<Clock className="text-green-600" size={20} />} bg="bg-green-100" />
          <QuickStat label="Technician" value={order.techinal || "Unassigned"} icon={<User className="text-purple-600" size={20} />} bg="bg-purple-100" />
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem label="Model Name" value={order.modelName} />
            <InfoItem label="VIN" value={order.vin} mono />
            <InfoItem label="Production Year" value={order.prodcutYear} />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Repair Progress</p>
              <p className="text-sm font-semibold text-gray-900">{order.percentInProcess || 0}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(order.percentInProcess)}`}
                style={{ width: `${order.percentInProcess || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { key: "technicians", label: "Technicians", icon: <UserCog size={18} /> },
              { key: "details", label: "Repair Details", icon: <Layers size={18} /> },
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
            ) : activeTab === "details" ? (
              renderTable(details)
            ) : (
              renderTable(steps)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

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
    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">{label}</p>
    <p className={`text-base font-semibold text-gray-900 ${mono ? "font-mono bg-gray-100 px-2 py-1 rounded inline-block" : ""}`}>
      {value || "–"}
    </p>
  </div>
);

const TechnicianTab = ({ currentTech, techs, selectedTech, setSelectedTech, handleAssignTech, updating }) => (
  <div>
    <h3 className="text-lg font-bold text-gray-900 mb-6">Technician Management</h3>

    {/* Current technician */}
    {currentTech ? (
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 bg-blue-600 rounded-lg">
            <User className="text-white" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xl">{currentTech.name}</h4>
            <p className="text-sm font-semibold text-blue-700">Currently Assigned</p>
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
          {updating ? <Loader size={18} className="animate-spin" /> : "Assign"}
        </button>
      </div>
    </div>
  </div>
);

export default RepairOrderDetail;
