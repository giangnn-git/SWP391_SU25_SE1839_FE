import { useState, useEffect } from "react";
import {
    // getAllUsersApi,
    // createUserApi,
    updateUserApi,
    toggleUserStatusApi,
    createClaimApi,
    getAllClaimsApi
} from "../services/api.service";
import UserTable from "../components/users/userTable.jsx";
import EditUserModal from "../components/users/editUserModal.jsx";
import CreateClaimModal from "../components/warranty/CreateClaimModal.jsx";
import ClaimTable from "../components/warranty/ClaimTable.jsx";

const WarrantyClaims = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    //
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Edit modal state
    const [editingUser, setEditingUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    // Create modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    // Load users
    const loadUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getAllClaimsApi();
            const claimData = response.data?.data || [];
            setUsers(claimData);
            setFilteredUsers(claimData);
        } catch (err) {
            setError(
                "Failed to load users: " + (err.response?.data?.message || err.message)
            );
            console.error("Load users error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Search function
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    // Create user function
    const handleCreateClaim = async (Data) => {
        setCreateLoading(true);
        setError("");
        try {
            await createClaimApi(
                Data.vin,
                Data.mileage,
                Data.priority,
                Data.partClaims,
                Data.attachments
            );
            setSuccess("Claim created successfully!");
            setIsCreateModalOpen(false);
            loadUsers(); // Refresh list
        } catch (err) {
            setError(
                "Failed to create claim: " + (err.response?.data?.message || err.message)
            );
            throw err;
        } finally {
            setCreateLoading(false);
        }
    };

    // Edit user functions
    const handleEditUser = (user) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (id, userData) => {
        setEditLoading(true);
        setError("");
        try {
            await updateUserApi(id, userData);
            setSuccess("User updated successfully!");
            setIsEditModalOpen(false);
            setEditingUser(null);
            loadUsers();
        } catch (err) {
            setError(
                "Failed to update user: " + (err.response?.data?.message || err.message)
            );
        } finally {
            setEditLoading(false);
        }
    };

    // Toggle user status
    const handleToggleStatus = async (id, isActive) => {
        setError("");
        try {
            await toggleUserStatusApi(id, isActive);
            setSuccess(
                `User ${isActive ? "activated" : "deactivated"} successfully!`
            );
            loadUsers();
        } catch (err) {
            setError(
                "Failed to update user status: " +
                (err.response?.data?.message || err.message)
            );
            throw err;
        }
    };

    // Clear messages
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess("");
                setError("");
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    return (
        <div className="p-6">
            {/* Header với Create Button và Search */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Warranty Claims</h1>
                    <p className="text-gray-600">Create and Management Claims</p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* ✅ SEARCH INPUT */}
                    {/* <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div> */}

                    {/* CREATE USER BUTTON */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                        + Create New Claim
                    </button>
                </div>
            </div>

            {/* Search Results Info */}
            {/* {searchTerm && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                        Showing {filteredUsers.length} of {users.length} users
                        {searchTerm && ` for "${searchTerm}"`}
                    </p>
                </div>
            )} */}

            {/* Messages */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700">{success}</p>
                </div>
            )}

            {/* Users Table - pass filteredUsers instead of users */}
            <div className="bg-white rounded-lg shadow-sm border">
                <ClaimTable
                    users={users}
                    // onEdit={handleEditUser}
                    // onStatusToggle={handleToggleStatus}
                    loading={loading}
                />
            </div>

            {/* Edit User Modal */}
            <EditUserModal
                user={editingUser}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingUser(null);
                }}
                onSave={handleSaveEdit}
                loading={editLoading}
            />

            {/* CREATE USER MODAL */}
            <CreateClaimModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateClaim}
                loading={createLoading}
            />
        </div>
    );
};

export default WarrantyClaims;
