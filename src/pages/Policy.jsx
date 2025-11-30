import React, { useState, useEffect } from "react";
import PartPolicyManagement from "../components/policies/Part/PartPolicyManagement";
import WarrantyPolicyManagement from "../components/policies/Warranty/WarrantyPolicyManagement";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Policy = () => {
  const [activeTab, setActiveTab] = useState("part");
  const [partPolicyRefresh, setPartPolicyRefresh] = useState(0);
  const [warrantyPolicyRefresh, setWarrantyPolicyRefresh] = useState(0);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Trigger refresh khi chuyển tab
    if (tab === "part") {
      setPartPolicyRefresh((prev) => prev + 1);
    } else if (tab === "warranty") {
      setWarrantyPolicyRefresh((prev) => prev + 1);
    }
  };

  return (
    <div className="p-6">

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-2">
        <Link to="/" className="hover:underline text-blue-600">Dashboard</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">Policy Management</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FileText /> Policy Management
        </h1>
        <p className="text-gray-500 mt-1">
          Manage part-specific and general warranty policies.
        </p>
      </div>

      {/* Modern Segmented Tabs */}
      <div className="flex justify-start mb-8">
        <div className="inline-flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => handleTabChange("part")}
            className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${activeTab === "part"
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Part Policy
          </button>
          <button
            onClick={() => handleTabChange("warranty")}
            className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${activeTab === "warranty"
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Warranty Policy
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div
        className={`transition-all duration-300 ${activeTab === "part" ? "opacity-100" : "hidden opacity-0"
          }`}
      >
        <PartPolicyManagement refreshTrigger={partPolicyRefresh} />
      </div>

      <div
        className={`transition-all duration-300 ${activeTab === "warranty" ? "opacity-100" : "hidden opacity-0"
          }`}
      >
        <WarrantyPolicyManagement refreshTrigger={warrantyPolicyRefresh} />
      </div>
    </div>
  );
};

export default Policy;
