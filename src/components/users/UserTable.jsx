import { useState } from "react";
import { storage } from "../../utils/storage";

const UserTable = ({ users, onEdit, onStatusToggle, loading }) => {
  const [actionLoading, setActionLoading] = useState(null);

  const handleStatusToggle = async (id, currentStatus) => {
    setActionLoading(id);
    try {
      await onStatusToggle(id, currentStatus === "ACTIVE");
    } catch (error) {
      console.error("Failed to toggle user status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const currentUserEmail = storage.get("userEmail");

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return <div className="text-center py-8 text-gray-500">No users found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              {/* Name Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name}
                  </div>
                  {user.email === currentUserEmail && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      You
                    </span>
                  )}
                </div>
              </td>

              {/* Email Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
              </td>

              {/* Phone Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {user.phoneNumber || "N/A"}
                </div>
              </td>

              {/* Role Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${
                    user.role === "ADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : user.role === "TECHNICIAN"
                      ? "bg-blue-100 text-blue-800"
                      : user.role === "SC_STAFF"
                      ? "bg-green-100 text-green-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {user.role}
                </span>
              </td>

              {/* Status Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleStatusToggle(user.id, user.status)}
                  disabled={
                    actionLoading === user.id || user.email === currentUserEmail
                  }
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      user.status === "ACTIVE"
                        ? "bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500"
                        : "bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500"
                    }
                    ${
                      actionLoading === user.id ||
                      user.email === currentUserEmail
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  s
                >
                  {actionLoading === user.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                      Processing
                    </div>
                  ) : user.status === "ACTIVE" ? (
                    <span className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Inactive
                    </span>
                  )}
                </button>
              </td>

              {/* Actions Column */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-3">
                  {/* Edit Button */}
                  <button
                    onClick={() => onEdit(user)}
                    className="inline-flex items-center text-blue-600 hover:text-blue-900 disabled:text-gray-400 transition-colors duration-200"
                    disabled={actionLoading === user.id}
                    title="Edit User"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
