import React, { useState } from "react";
import { Eye, Edit, Calendar, Car, Hash, Plus } from "lucide-react";
import ViewCampaignModal from "./ViewCampaignModal";

const CampaignTable = ({
  campaigns,
  loading,
  onRefresh,
  onCreateCampaign,
  onEdit, // ✅ thêm prop mới
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Active",
      },
      UPCOMING: {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        label: "Upcoming",
      },
      COMPLETED: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Completed",
      },
    };

    const config = statusConfig[status] || statusConfig.UPCOMING;
    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDateRange = (startDate, endDate) => {
    return `${startDate} to ${endDate}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading campaigns...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-orange-600" />
              Campaign List
            </h3>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                Showing {campaigns.length} campaigns
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Campaign Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Production Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Vehicles
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Campaign Info */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Hash size={16} className="text-gray-400" />
                        <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {campaign.code}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {campaign.name}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {campaign.description}
                      </p>
                    </div>
                  </td>

                  {/* Campaign Date Range */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar size={14} className="text-gray-400" />
                      <span>
                        {formatDateRange(
                          campaign.formattedStartDate,
                          campaign.formattedEndDate
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Production Date Range */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      <div className="flex items-center gap-1 mb-1">
                        <Car size={14} className="text-gray-400" />
                        <span>From: {campaign.formattedProduceFrom}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Car size={14} className="text-gray-400" />
                        <span>To: {campaign.formattedProduceTo}</span>
                      </div>
                    </div>
                  </td>

                  {/* Vehicles Count */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          campaign.totalVehicles > 0
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {campaign.totalVehicles} vehicles
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {getStatusBadge(campaign.status)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                        onClick={() => setSelectedCampaign(campaign)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit Campaign"
                        onClick={() => {
                          onEdit && onEdit(campaign); //   callback mở modal edit
                        }}
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {campaigns.length === 0 && (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No campaigns found
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Get started by creating your first campaign to manage vehicle
                recalls and service campaigns.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Campaign Modal */}
      {selectedCampaign && (
        <ViewCampaignModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </>
  );
};

export default CampaignTable;
