import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Loader,
  AlertCircle,
  UserCog,
  Layers,
  List,
  ArrowLeft,
  CheckCircle,
  Clock,
  User,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "../services/axios.customize";

const RepairOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("technicians");
  const [loadingTab, setLoadingTab] = useState(false);

  const [techs, setTechs] = useState([]);
  const [details, setDetails] = useState([]);
  const [steps, setSteps] = useState([]);

  const [selectedTech, setSelectedTech] = useState("");
  const [updating, setUpdating] = useState(false);
  const [currentTech, setCurrentTech] = useState(null);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/api/api/repairOrders/${id}`);
      const orderData = res.data?.data || {};
      setOrder(orderData);
    } catch (err) {
      console.error("Failed to fetch repair order:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechs = async () => {
    try {
      setLoadingTab(true);
      const res = await axios.get(`/api/auth/techinicals`);
      const technicians = res.data?.data?.technicians || [];
      setTechs(technicians);
    } catch (err) {
      console.error("Failed to fetch technicians:", err);
    } finally {
      setLoadingTab(false);
    }
  };

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

  const handleAssignTech = async () => {
    if (!selectedTech) return toast.error("Please select a technician");
    try {
      setUpdating(true);
      await axios.put(`/api/api/repairOrders/${id}`, {
        technicalName: selectedTech,
      });
      toast.success("Technician updated successfully!");
      await fetchOrder();
      await fetchTechs();
      setSelectedTech("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update technician.");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchTechs();
  }, [id]);

  useEffect(() => {
    if (order && techs.length > 0 && order.techinal) {
      const tech = techs.find((t) => t.name === order.techinal);
      setCurrentTech(tech || null);
    }
  }, [order, techs]);

  useEffect(() => {
    if (activeTab === "details" && details.length === 0) fetchDetails();
    if (activeTab === "steps" && steps.length === 0) fetchSteps();
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

  if (!order)
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto bg-white rounded-lg border border-red-200 p-6">
          <div className="flex gap-3 items-start">
            <AlertCircle
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={24}
            />
            <div>
              <h3 className="font-semibold text-red-900">
                Repair Order Not Found
              </h3>
              <p className="text-red-700 text-sm mt-1">
                The repair order you're looking for doesn't exist or has been
                removed.
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

  const renderTable = (data) => {
    if (loadingTab) {
      return (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No data available</p>
          <p className="text-gray-400 text-sm mt-1">
            There are no items to display for this section
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, i) => (
              <tr key={i} className="hover:bg-blue-50 transition-colors">
                {Object.values(item).map((val, j) => (
                  <td
                    key={j}
                    className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                  >
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

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-gray-400";
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
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
              RO-{String(order.repairOrderId || id).padStart(4, "0")}
            </span>
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  Status
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {order.status ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  Progress
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-gray-900">
                    {order.percentInProcess || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  Technician
                </p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {order.techinal || "Unassigned"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Order Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem label="Model Name" value={order.modelName} />
            <InfoItem label="VIN" value={order.vin} mono />
            <InfoItem label="Production Year" value={order.prodcutYear} />
          </div>

          {/* Progress Bar */}
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
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              {
                key: "technicians",
                label: "Technicians",
                icon: <UserCog size={18} />,
              },
              {
                key: "details",
                label: "Repair Details",
                icon: <Layers size={18} />,
              },
              { key: "steps", label: "Repair Steps", icon: <List size={18} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === tab.key
                    ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "technicians" ? (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Technician Management
                </h3>

                {/* Current Technician Card */}
                {currentTech ? (
                  <div className="mb-6 p-5 border-2 border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <User className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {currentTech.name}
                        </h4>
                        <p className="text-sm text-blue-700 font-medium">
                          Currently Assigned
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                          Status
                        </p>
                        <p className="text-sm text-gray-900 font-medium">
                          {currentTech.message}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                          Assigned Jobs
                        </p>
                        <p className="text-sm text-gray-900 font-medium">
                          {currentTech.countJob}
                        </p>
                      </div>
                      {currentTech.earliestEnd && (
                        <div className="col-span-2">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                            Earliest End
                          </p>
                          <p className="text-sm text-gray-900 font-medium">
                            {new Date(
                              currentTech.earliestEnd[0],
                              currentTech.earliestEnd[1] - 1,
                              currentTech.earliestEnd[2],
                              currentTech.earliestEnd[3],
                              currentTech.earliestEnd[4]
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-5 border border-gray-200 rounded-lg bg-gray-50 text-center">
                    <User className="text-gray-300 mx-auto mb-2" size={32} />
                    <p className="text-gray-500 font-medium">
                      No technician assigned yet
                    </p>
                  </div>
                )}

                {/* Assign New Technician */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {currentTech ? "Reassign Technician" : "Assign Technician"}
                  </h4>
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
                        <>
                          <Loader size={18} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Assign"
                      )}
                    </button>
                  </div>
                </div>
              </div>
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

const InfoItem = ({ label, value, mono = false }) => (
  <div>
    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
      {label}
    </p>
    <p
      className={`text-base font-semibold text-gray-900 ${
        mono ? "font-mono bg-gray-100 px-2 py-1 rounded inline-block" : ""
      }`}
    >
      {value || "–"}
    </p>
  </div>
);

export default RepairOrderDetail;
