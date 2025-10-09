import React, { useState } from "react";
import PartPolicyManagement from "./PartPolicyManagement";
import WarrantyPolicyManagement from "./WarrantyPolicyManagement";

const Policy = () => {
    const [activeTab, setActiveTab] = useState("part");

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    📑 Policy Management
                </h1>
                <p className="text-gray-500 mt-1">
                    Manage part-specific and general warranty policies.
                </p>
            </div>

            {/* Modern Segmented Tabs */}
            <div className="flex justify-start mb-8">
                <div className="inline-flex bg-gray-100 rounded-full p-1">
                    <button
                        onClick={() => setActiveTab("part")}
                        className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${activeTab === "part"
                            ? "bg-white shadow-sm text-gray-900"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Part Policy
                    </button>
                    <button
                        onClick={() => setActiveTab("warranty")}
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
                <PartPolicyManagement />
            </div>

            <div
                className={`transition-all duration-300 ${activeTab === "warranty" ? "opacity-100" : "hidden opacity-0"
                    }`}
            >
                <WarrantyPolicyManagement />
            </div>
        </div>
    );
};

export default Policy;
