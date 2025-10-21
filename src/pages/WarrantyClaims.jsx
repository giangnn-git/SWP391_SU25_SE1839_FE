import { useState, useEffect } from "react";
import { PlusCircle, Search } from "lucide-react";
import axios from "../services/axios.customize";
import CreateClaimModal from "../components/warranty/CreateClaimModal";
import ClaimTable from "../components/warranty/ClaimTable";
import ClaimSummary from "../components/warranty/ClaimSummary";
import { Link } from "react-router-dom";

const WarrantyClaimsManagement = () => {
    const [claims, setClaims] = useState([]);
    const [scr, setScr] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1); // pagination state

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/api/claims");
            const data = res.data?.data || {};
            setScr(data.scr || null);
            setClaims(data.fcr || []);
        } catch (err) {
            console.error(err);
            setError("Cannot display list of claim!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const handleClaimCreated = async (newClaim) => {
        try {

            const formattedClaim = {
                id: newClaim.id,
                vin: newClaim.vin || "",
                licensePlate: newClaim.licensePlate || "",
                description: newClaim.description || "",
                priority: newClaim.priority?.toLowerCase() || "normal",
                currentStatus: newClaim.currentStatus || "pending",
                claimDate: newClaim.claimDate || new Date().toISOString(),
                senderName: newClaim.senderName || "",
                userName: newClaim.userName || ""
            };


            setClaims(prev => [formattedClaim, ...prev]);
            setCurrentPage(1);


            fetchClaims();
        } catch (err) {
            console.error("Error updating claim list:", err);
        }
    };



    // Filter search + priority + status
    const filteredClaims = claims.filter((c) => {
        const matchSearch =
            searchTerm
                ? c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.vin?.toLowerCase().includes(searchTerm.toLowerCase())
                : true;

        const matchPriority =
            priorityFilter === "all" ? true : c.priority?.toLowerCase() === priorityFilter.toLowerCase();

        const matchStatus =
            statusFilter === "all" ? true : c.currentStatus?.toLowerCase() === statusFilter.toLowerCase();

        return matchSearch && matchPriority && matchStatus;
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-2">
                <Link to="/" className="hover:underline text-blue-600">Dashboard</Link>
                <span className="mx-1">/</span>
                <Link to="/warranty-claims" className="text-gray-700 font-medium">Warranty Claims</Link>
            </div>

            {/* Title */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Warranty Claims Management</h1>
                <p className="text-gray-600 text-sm mt-1">Manage and track all warranty claims</p>
            </div>

            {/* Summary Cards */}
            <ClaimSummary scr={scr} loading={loading} error={error} />

            {/* Filters + Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Search */}
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by VIN or description..."
                            className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Priority Filter */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="in-progress">In Progress</option>
                    </select>
                </div>

                {/* New Claim Button */}
                <button
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition duration-200 font-medium"
                    onClick={() => setShowCreateModal(true)}
                >
                    <PlusCircle size={18} />
                    New Claim
                </button>
            </div>

            {/* Table */}
            <ClaimTable
                claims={filteredClaims}
                loading={loading}
                error={error}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                fetchClaims={fetchClaims}
            />
            {/* Modal */}
            {showCreateModal && (
                <CreateClaimModal
                    onClose={() => setShowCreateModal(false)}
                    onClaimCreated={handleClaimCreated}
                />
            )}
        </div>

    );
};

export default WarrantyClaimsManagement;
