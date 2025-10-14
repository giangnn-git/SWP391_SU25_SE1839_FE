import React, { useState } from "react";
import ClaimOverviewCard from "../components/claims/ClaimOverviewCard";
import ClaimTableAdvanced from "../components/claims/ClaimTableAdvanced";
import { Search, Filter } from "lucide-react";

const ClaimApproval = () => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");

    //  Dummy data (replace with API later)
    const claims = [
        {
            id: "WC-2024-001",
            vin: "1HGBH41JXMN109186",
            model: "2023 Tesla Model 3",
            customer: "John Smith",
            serviceCenter: "AutoService Plus",
            cost: 2500,
            labor: "8h labor",
            priority: "High",
            warranty: "Valid",
            warrantyEnd: "2031-03-15",
            date: "2024-01-15",
            submittedBy: "Mike Tech",
            status: "Pending",
        },
        {
            id: "WC-2024-002",
            vin: "2AHDW32KZMN991028",
            model: "2022 VinFast VF8",
            customer: "Nguyen Van An",
            serviceCenter: "Hanoi EV Center",
            cost: 4000,
            labor: "12h labor",
            priority: "Medium",
            warranty: "Valid",
            warrantyEnd: "2030-09-20",
            date: "2024-02-12",
            submittedBy: "Trung Le",
            status: "Pending",
        },
    ];

    //  Filtering logic
    const filteredClaims = claims.filter((claim) => {
        const matchesSearch =
            claim.id.toLowerCase().includes(search.toLowerCase()) ||
            claim.vin.toLowerCase().includes(search.toLowerCase()) ||
            claim.customer.toLowerCase().includes(search.toLowerCase()) ||
            claim.serviceCenter.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = status === "All" || claim.status === status;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Warranty Claim Approval
                </h1>
                <p className="text-gray-500 mt-1">
                    Review and approve warranty claims submitted from service centers.
                </p>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-4 gap-5">
                <ClaimOverviewCard
                    title="Pending Reviews"
                    value="3"
                    sub="Awaiting decision"
                    color="yellow"
                />
                <ClaimOverviewCard
                    title="High Priority"
                    value="1"
                    sub="Urgent claims"
                    color="red"
                />
                <ClaimOverviewCard
                    title="Total Value"
                    value="$6,500"
                    sub="Awaiting approval"
                    color="blue"
                />
                <ClaimOverviewCard
                    title="Approval Rate"
                    value="87%"
                    sub="This month"
                    color="green"
                />
            </div>

            {/* Filter & Search section */}
            <div className="bg-white shadow-sm rounded-xl p-4 flex items-center justify-between gap-3">
                {/* Search box */}
                <div className="flex items-center gap-2 flex-1">
                    <Search size={18} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by claim ID, VIN, customer, or service center..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border-none outline-none text-sm bg-transparent"
                    />
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-2 border-l pl-4">
                    <Filter size={16} className="text-gray-500" />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border rounded-lg px-3 py-1.5 text-sm"
                    >
                        <option>All</option>
                        <option>Pending</option>
                        <option>Approved</option>
                        <option>Rejected</option>
                    </select>
                </div>
            </div>

            {/* Claims table */}
            <ClaimTableAdvanced data={filteredClaims} />
        </div>
    );
};

export default ClaimApproval;
