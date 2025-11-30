import React from "react";

const ScCampaignVehiclesTable = ({ rows = [], loading, error = null }) => {
  if (loading) {
    return (
      <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        Loading vehicles…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 text-red-700">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <div className="font-medium">Error</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="px-4 py-3 font-semibold">Campaign</th>
            <th className="px-4 py-3 font-semibold">VIN</th>
            <th className="px-4 py-3 font-semibold">Customer</th>
            <th className="px-4 py-3 font-semibold">Contact</th>
            <th className="px-4 py-3 font-semibold">Address</th>
            <th className="px-4 py-3 font-semibold">Start</th>
            <th className="px-4 py-3 font-semibold">End</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, idx) => (
            <tr key={`${r.vin}-${idx}`} className="hover:bg-gray-50">
              <td className="px-4 py-3">{r.campaignName}</td>
              <td className="px-4 py-3 font-mono">{r.vin}</td>
              <td className="px-4 py-3">{r.customerName}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span>{r.email}</span>
                  <span className="text-gray-500">{r.phoneNumber}</span>
                </div>
              </td>
              <td className="px-4 py-3">{r.address}</td>
              <td className="px-4 py-3">{r.formattedStartDate}</td>
              <td className="px-4 py-3">{r.formattedEndDate}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-gray-200 bg-gray-100 text-gray-800">
                  {r.status}
                </span>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                No vehicles found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ScCampaignVehiclesTable;
