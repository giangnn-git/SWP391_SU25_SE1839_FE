import { useState, useEffect } from "react";
import { PlusCircle, Search } from "lucide-react";
import axios from "../services/axios.customize";
import CreateClaimModal from "../components/warranty/CreateClaimModal";
import ClaimTable from "../components/warranty/ClaimTable";

const WarrantyClaimsManagement = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // ✅ Fetch claims
    const fetchClaims = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/api/claims");
            setClaims(res.data?.data?.fcr || []);
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

    // ✅ Khi tạo mới, thêm claim vào đầu danh sách
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
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">🧾 Warranty Claims Management</h2>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm claim..."
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        className="flex items-center bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md transition"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <PlusCircle size={18} className="mr-2" />
                        Thêm Claim
                    </button>
                </div>
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
