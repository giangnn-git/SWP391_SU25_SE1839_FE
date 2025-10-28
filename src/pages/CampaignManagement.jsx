import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Search,
  Filter,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import CreateCampaignModal from "../components/campaigns/CreateCampaignModal";
import EditCampaignModal from "../components/campaigns/EditCampaignModal";
import CampaignTable from "../components/campaigns/CampaignTable";
import CampaignOverviewCard from "../components/campaigns/CampaignOverviewCard";
import { getAllCampaignsApi } from "../services/api.service";

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Format date (dd/mm/yyyy)
  const formatDate = (dateArray) => {
    if (!dateArray || dateArray.length !== 3) return "N/A";
    const [year, month, day] = dateArray;
    return `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${year}`;
  };

  // Hàm parse date array sang Date object để sort
  const parseDateArrayToDate = (dateArray) => {
    if (!dateArray || dateArray.length !== 3) return new Date(0);
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day);
  };

  // Check campaign status với format dd/mm/yyyy
  const getCampaignStatus = (campaign) => {
    const today = new Date();

    // Convert dd/mm/yyyy to Date object
    const parseDDMMYYYY = (dateStr) => {
      const [day, month, year] = dateStr.split("/").map(Number);
      return new Date(year, month - 1, day);
    };

    const startDate = parseDDMMYYYY(formatDate(campaign.startDate));
    const endDate = parseDDMMYYYY(formatDate(campaign.endDate));

    if (today < startDate) return "UPCOMING";
    if (today > endDate) return "COMPLETED";
    return "ACTIVE";
  };

  // Fetch campaigns từ API
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllCampaignsApi();
      const campaignsData = response.data?.data?.campaigns || [];

      // Sắp xếp tăng dần theo start date
      const sortedCampaigns = [...campaignsData].sort((a, b) => {
        const dateA = parseDateArrayToDate(a.startDate);
        const dateB = parseDateArrayToDate(b.startDate);
        return dateA - dateB; // Tăng dần (cũ -> mới)
      });

      // Format data với status và dates dd/mm/yyyy
      const formattedCampaigns = sortedCampaigns.map((campaign) => ({
        ...campaign,
        status: getCampaignStatus(campaign),
        formattedStartDate: formatDate(campaign.startDate),
        formattedEndDate: formatDate(campaign.endDate),
        formattedProduceFrom: formatDate(campaign.produceDateFrom),
        formattedProduceTo: formatDate(campaign.produceDateTo),
      }));

      setCampaigns(formattedCampaigns);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("Failed to load campaign data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Handle campaign creation success
  const handleCampaignCreated = () => {
    fetchCampaigns(); // reload danh sách
    setShowCreateModal(false);
  };

  // Handle campaign update success
  const handleCampaignUpdated = () => {
    fetchCampaigns(); // reload danh sách
    setShowEditModal(false);
    setSelectedCampaign(null);
  };

  // Statistics với real data
  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "ACTIVE").length,
    upcoming: campaigns.filter((c) => c.status === "UPCOMING").length,
    completed: campaigns.filter((c) => c.status === "COMPLETED").length,
  };

  // Filter logic
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus
      ? campaign.status === filterStatus
      : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <AlertTriangle size={26} className="text-orange-600" />
          <h1 className="text-2xl font-semibold">Campaign Management</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="flex items-center bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 rounded-md transition shadow-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusCircle size={18} className="mr-2" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        <CampaignOverviewCard
          title="Total Campaigns"
          value={stats.total.toString()}
          sub="All campaigns"
          color="blue"
          icon={<AlertTriangle size={20} />}
        />
        <CampaignOverviewCard
          title="Active"
          value={stats.active.toString()}
          sub="Currently running"
          color="green"
          icon={<Calendar size={20} />}
        />
        <CampaignOverviewCard
          title="Upcoming"
          value={stats.upcoming.toString()}
          sub="Scheduled campaigns"
          color="orange"
          icon={<Calendar size={20} />}
        />
        <CampaignOverviewCard
          title="Completed"
          value={stats.completed.toString()}
          sub="Finished campaigns"
          color="gray"
          icon={<Calendar size={20} />}
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm flex flex-wrap gap-3 items-center">
        <Filter size={18} className="text-gray-600" />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-80"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Campaign Table */}
      <CampaignTable
        campaigns={filteredCampaigns}
        loading={loading}
        onRefresh={fetchCampaigns}
        onEdit={(campaign) => {
          setSelectedCampaign(campaign);
          setShowEditModal(true);
        }}
      />

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCampaignCreated={handleCampaignCreated}
        />
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && selectedCampaign && (
        <EditCampaignModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          campaign={selectedCampaign}
          onCampaignUpdated={handleCampaignUpdated}
        />
      )}
    </div>
  );
};

export default CampaignManagement;
