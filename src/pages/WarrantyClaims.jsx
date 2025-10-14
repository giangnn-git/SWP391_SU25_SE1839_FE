import { useState, useEffect } from "react";
import { PlusCircle, Search } from "lucide-react";
import axios from "../services/axios.customize";
import CreateClaimModal from "../components/warranty/CreateClaimModal";
import ClaimTable from "../components/warranty/ClaimTable";
import ClaimSummary from "../components/warranty/ClaimSummary";

const WarrantyClaimsManagement = () => {
    const [claims, setClaims] = useState([]);
    const [scr, setScr] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/api/claims");
            const data = res.data?.data || {};
            setScr(data.scr || null);
            setClaims(data.fcr || []);
        } catch (err) {
            console.error(err);
            setError("Không thể tải danh sách claim!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const handleClaimCreated = (newClaim) => {
        setClaims((prev) => [newClaim, ...prev]);
    };

    const filteredClaims = claims.filter((c) =>
        searchTerm
            ? c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.vin?.toLowerCase().includes(searchTerm.toLowerCase())
            : true
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Title & Description */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Warranty Claims Management</h1>
                <p className="text-gray-600 text-sm mt-1">Manage and track all warranty claims</p>
            </div>

            {/* Summary Cards */}
            <ClaimSummary scr={scr} loading={loading} error={error} />

            {/* Search & Actions */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex-1 max-w-md relative">
                    <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by VIN or description..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

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
