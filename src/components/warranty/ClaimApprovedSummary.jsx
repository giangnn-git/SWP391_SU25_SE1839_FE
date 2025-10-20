import React from "react";

const ClaimApprovedSummary = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-pulse">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-xl h-24 border border-gray-200"
            ></div>
          ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Pending Reviews",
      value: summary?.pending || 0,
      sub: "Awaiting decision",
    },
    {
      title: "High Priority",
      value: summary?.highPriority || 0,
      sub: "Urgent requests",
    },
    {
      title: "Total Value",
      value: summary?.totalValue ? `$${summary.totalValue}` : "$0",
      sub: "Under review",
    },
    {
      title: "Approval Rate",
      value: summary?.approvalRate
        ? `${summary.approvalRate}%`
        : "0%",
      sub: "This month",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
        >
          <p className="text-sm text-gray-500">{card.title}</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">
            {card.value}
          </h2>
          <p className="text-sm text-gray-400">{card.sub}</p>
        </div>
      ))}
    </div>
  );
};

export default ClaimApprovedSummary;
