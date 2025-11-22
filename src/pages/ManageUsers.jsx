import { useState, useEffect } from "react";
import {
  getAllUsersApi,
  createUserApi,
  updateUserApi,
  toggleUserStatusApi,
} from "../services/api.service";
import UserTable from "../components/users/UserTable.jsx";
import EditUserModal from "../components/users/EditUserModal.jsx";
import CreateUserModal from "../components/users/CreateUserModal.jsx";
import { Users } from "lucide-react";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Phân trang state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalItems, setTotalItems] = useState(0);

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
      const response = await getAllUsersApi();
      const usersData = response.data?.data || [];
      setUsers(usersData);
      setFilteredUsers(usersData);
      setTotalItems(usersData.length);
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
      setTotalItems(users.length);
      setCurrentPage(1); // Reset về trang 1 khi search
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
      setTotalItems(filtered.length);
      setCurrentPage(1); // Reset về trang 1 khi search
    }
  }, [searchTerm, users]);

  // Tính toán users hiển thị trên trang hiện tại
  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Xử lý thay đổi items per page
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset về trang đầu tiên
  };

  // Create user function
  const handleCreateUser = async (userData) => {
    setCreateLoading(true);
    setError("");
    try {
      await createUserApi({
        email: userData.email,
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        serviceCenterId: userData.serviceCenterId,
      });

      setSuccess("User created successfully!");
      setIsCreateModalOpen(false);
      loadUsers();
    } catch (err) {
      setError(
        "Failed to create user: " + (err.response?.data?.message || err.message)
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
  const handleToggleStatus = async (id, currentIsActive) => {
    setError("");
    try {
      const targetUser = users.find((user) => user.id === id);
      if (!targetUser) {
        throw new Error("User not found");
      }

      await toggleUserStatusApi(id, !currentIsActive);

      setSuccess(
        `User ${!currentIsActive ? "activated" : "deactivated"} successfully!`
      );

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id
            ? {
                ...user,
                isActive: !currentIsActive,
                status: !currentIsActive ? "ACTIVE" : "INACTIVE",
              }
            : user
        )
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "You don't have permission to perform this action";
      setError(errorMessage);
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

  // Component phân trang
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      let startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      // Nút trang đầu
      if (startPage > 1) {
        pages.push(
          <button
            key={1}
            onClick={() => handlePageChange(1)}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            1
          </button>
        );
        if (startPage > 2) {
          pages.push(
            <span key="start-ellipsis" className="px-2 py-1 text-gray-500">
              ...
            </span>
          );
        }
      }

      // Các trang
      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 text-sm border rounded ${
              currentPage === i
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {i}
          </button>
        );
      }

      // Nút trang cuối
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push(
            <span key="end-ellipsis" className="px-2 py-1 text-gray-500">
              ...
            </span>
          );
        }
        pages.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            {totalPages}
          </button>
        );
      }

      return pages;
    };

    return (
      <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg">
        {/* Chỉ giữ phần điều hướng trang bên phải */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {renderPageNumbers()}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header với Create Button và Search */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users />
            User Management
          </h1>
          <p className="text-gray-600">Manage system users and permissions</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* SEARCH INPUT */}
          <div className="relative">
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
          </div>

          {/* CREATE USER BUTTON */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            + Create New User
          </button>
        </div>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Found {filteredUsers.length} users for "{searchTerm}"
          </p>
        </div>
      )}

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

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <UserTable
          users={getCurrentPageUsers()}
          onEdit={handleEditUser}
          onStatusToggle={handleToggleStatus}
          loading={loading}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
        <Pagination />
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
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        loading={createLoading}
      />
    </div>
  );
};

export default ManageUsers;
