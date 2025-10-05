import { useState, useEffect } from "react";
import {
  getAllUsersApi,
  createUserApi,
  updateUserApi,
  toggleUserStatusApi,
} from "../services/api.service";
import CreateUserForm from "../components/forms/CreateUserForm";
import UserTable from "../components/users/userTable";
import EditUserModal from "../components/users/editUserModal";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllUsersApi();
      setUsers(response.data?.data || response.data || []);
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

  // Create user
  const handleCreateUser = async (userData) => {
    setError("");
    setSuccess("");
    try {
      await createUserApi(userData.name, userData.password, userData.role);
      setSuccess("User created successfully!");
      loadUsers(); // Refresh list
    } catch (err) {
      setError(
        "Failed to create user: " + (err.response?.data?.message || err.message)
      );
      throw err; // Re-throw để form xử lý
    }
  };

  // Edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (userId, userData) => {
    setEditLoading(true);
    setError("");
    try {
      await updateUserApi(userId, userData);
      setSuccess("User updated successfully!");
      setIsEditModalOpen(false);
      setEditingUser(null);
      loadUsers(); // Refresh list
    } catch (err) {
      setError(
        "Failed to update user: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setEditLoading(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId, isActive) => {
    setError("");
    try {
      await toggleUserStatusApi(userId, isActive);
      setSuccess(
        `User ${isActive ? "activated" : "deactivated"} successfully!`
      );
      loadUsers(); // Refresh list
    } catch (err) {
      setError(
        "Failed to update user status: " +
          (err.response?.data?.message || err.message)
      );
      throw err;
    }
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage system users and permissions</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Create New User</h2>
            <CreateUserForm onSubmit={handleCreateUser} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">All Users</h2>
              <button
                onClick={loadUsers}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <UserTable
              users={users}
              onEdit={handleEditUser}
              onStatusToggle={handleToggleStatus}
              loading={loading}
            />
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default ManageUsers;
