import { useState } from "react";
import {
    Search,
    CheckCircle,
    XCircle,
    Eye,
    AlertTriangle,
    X,
    Clock4,
    DollarSign,
    TrendingUp,
    Flag,
} from "lucide-react";
import { Link } from "react-router-dom";

const ClaimApprove = () => {
    const [statusFilter, setStatusFilter] = useState("pending");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    const [claims, setClaims] = useState([
        {
            id: "WC-2024-001",
            vin: "1HG8H41JXMN109186",
            vehicle: "2023 Tesla Model 3",
            customer: "John Smith",
            serviceCenter: "AutoService Plus",
            cost: "$2,500",
            priority: "High",
            laborHours: "8h labor",
            warrantyStatus: "Valid",
            validUntil: "2031-03-15",
            status: "Pending",
            sender: "Mike Tech",
            date: "2024-01-15",
            description:
                "Battery does not charge beyond 80%, requires inspection and possible module replacement.",
        },
    ]);

    const filteredClaims = claims.filter(
        (c) =>
            (statusFilter === "all" ||
                c.status.toLowerCase() === statusFilter.toLowerCase()) &&
            (searchTerm === "" ||
                c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.serviceCenter.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleConfirmAction = () => {
        if (!confirmAction) return;
        const { type, claim } = confirmAction;
        setClaims((prev) =>
            prev.map((c) =>
                c.id === claim.id
                    ? { ...c, status: type === "approve" ? "Approved" : "Rejected" }
                    : c
            )
        );
        setConfirmAction(null);
    };

    const summaryCards = [
        {
            title: "Pending Reviews",
            value: "3",
            sub: "Awaiting decision",
            icon: Clock4,
            color: "from-yellow-100 to-yellow-50 text-yellow-700 border-yellow-200",
        },
        {
            title: "High Priority",
            value: "1",
            sub: "Urgent requests",
            icon: Flag,
            color: "from-red-100 to-red-50 text-red-700 border-red-200",
        },
        {
            title: "Total Value",
            value: "$6,500",
            sub: "Under review",
            icon: DollarSign,
            color: "from-blue-100 to-blue-50 text-blue-700 border-blue-200",
        },
        {
            title: "Approval Rate",
            value: "87%",
            sub: "This month",
            icon: TrendingUp,
            color: "from-green-100 to-green-50 text-green-700 border-green-200",
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-2">
                <Link to="/" className="hover:underline text-blue-600">
                    Dashboard
                </Link>
                <span className="mx-1">/</span>
                <span className="text-gray-700 font-medium">
                    Warranty Claim Approval
                </span>
            </div>

            {/* Title */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Warranty Claim Approval
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                    Review and approve warranty requests from service centers
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                {summaryCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={i}
                            className={`flex items-center gap-4 bg-gradient-to-br ${card.color} p-4 border rounded-2xl shadow-sm hover:shadow-md transition`}
                        >
                            <div className="p-3 bg-white/70 rounded-xl">
                                <Icon size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    {card.title}
                                </p>
                                <h2 className="text-2xl font-bold leading-tight">
                                    {card.value}
                                </h2>
                                <p className="text-xs text-gray-500">{card.sub}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by claim ID, VIN, customer, or service center..."
                            className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-full px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b text-gray-700 text-sm font-medium bg-gray-50 rounded-t-2xl">
                    Approval Requests ({filteredClaims.length} found)
                </div>

                <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs border-b">
                        <tr>
                            {[
                                "Claim ID",
                                "Vehicle & Customer",
                                "Service Center",
                                "Cost",
                                "Priority",
                                "Warranty",
                                "Status",
                                "Actions",
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="py-3 px-5 text-left font-semibold tracking-wide text-gray-600"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {filteredClaims.map((c, i) => (
                            <tr
                                key={i}
                                className="border-b last:border-none hover:bg-gray-50 transition duration-150 align-middle"
                            >
                                {/* Claim ID */}
                                <td className="py-4 px-5 align-middle">
                                    <div className="font-semibold text-gray-900">{c.id}</div>
                                    <div className="text-xs text-gray-500 leading-snug">
                                        VIN: {c.vin}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Sent: {c.date} by {c.sender}
                                    </div>
                                </td>

                                {/* Vehicle & Customer */}
                                <td className="py-4 px-5 align-middle">
                                    <div className="font-medium text-gray-900">{c.vehicle}</div>
                                    <div className="text-gray-600 text-sm">{c.customer}</div>
                                </td>

                                {/* Service Center */}
                                <td className="py-4 px-5 align-middle">
                                    <span className="text-gray-700">{c.serviceCenter}</span>
                                </td>

                                {/* Cost */}
                                <td className="py-4 px-5 align-middle">
                                    <div className="text-gray-800 font-semibold">{c.cost}</div>
                                    <div className="text-xs text-gray-400">{c.laborHours}</div>
                                </td>

                                {/* Priority */}
                                <td className="py-4 px-5 align-middle">
                                    <span
                                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${c.priority === "High"
                                            ? "bg-red-100 text-red-700"
                                            : c.priority === "Normal"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {c.priority}
                                    </span>
                                </td>

                                {/* Warranty */}
                                <td className="py-4 px-5 align-middle">
                                    <span
                                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${c.warrantyStatus === "Valid"
                                            ? "bg-blue-900 text-white"
                                            : "bg-gray-200 text-gray-700"
                                            }`}
                                    >
                                        {c.warrantyStatus === "Valid" ? "Valid" : "Expired"}
                                    </span>
                                    <div
                                        className={`text-xs mt-1 ${c.warrantyStatus === "Valid"
                                            ? "text-gray-500"
                                            : "text-red-500 font-medium"
                                            }`}
                                    >
                                        Until: {c.validUntil}
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="py-4 px-5 align-middle">
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.status === "Pending"
                                            ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                                            : c.status === "Approved"
                                                ? "bg-green-50 text-green-800 border border-green-200"
                                                : "bg-red-50 text-red-800 border border-red-200"
                                            }`}
                                    >
                                        <Clock4 size={12} />
                                        {c.status}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="py-4 px-5 align-middle">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedClaim(c)}
                                            title="View details"
                                            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                                        >
                                            <Eye size={16} />
                                        </button>

                                        {c.status === "Pending" && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        setConfirmAction({ type: "approve", claim: c })
                                                    }
                                                    title="Approve"
                                                    className="flex items-center justify-center w-8 h-8 rounded-full border border-green-400 text-green-600 hover:bg-green-50 transition"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setConfirmAction({ type: "reject", claim: c })
                                                    }
                                                    title="Reject"
                                                    className="flex items-center justify-center w-8 h-8 rounded-full border border-red-400 text-red-600 hover:bg-red-50 transition"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Detail Modal */}
            {selectedClaim && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-[500px] p-6 relative animate-fadeIn border-t-4 border-blue-500">
                        <button
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                            onClick={() => setSelectedClaim(null)}
                        >
                            <X size={18} />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Claim Details
                        </h2>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p><strong>ID:</strong> {selectedClaim.id}</p>
                            <p><strong>VIN:</strong> {selectedClaim.vin}</p>
                            <p><strong>Vehicle:</strong> {selectedClaim.vehicle}</p>
                            <p><strong>Customer:</strong> {selectedClaim.customer}</p>
                            <p><strong>Service Center:</strong> {selectedClaim.serviceCenter}</p>
                            <p><strong>Issue:</strong> {selectedClaim.description}</p>
                            <p><strong>Status:</strong> {selectedClaim.status}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Popup */}
            {confirmAction && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-[380px] p-6 text-center border-t-4 border-yellow-500">
                        <AlertTriangle className="mx-auto text-yellow-500 mb-3" size={36} />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {confirmAction.type === "approve"
                                ? "Approve this claim?"
                                : "Reject this claim?"}
                        </h3>
                        <p className="text-gray-600 text-sm mb-5">
                            Are you sure you want to{" "}
                            {confirmAction.type === "approve" ? "approve" : "reject"} claim{" "}
                            <span className="font-medium">{confirmAction.claim.id}</span>?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handleConfirmAction}
                                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${confirmAction.type === "approve"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                {confirmAction.type === "approve" ? "Approve" : "Reject"}
                            </button>
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimApprove;
