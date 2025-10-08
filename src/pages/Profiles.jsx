import { useState } from "react";
import { storage } from "../utils/storage";
import ChangePasswordModal from "../components/auth/ChangePassModal";

const ProfilePage = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);

  const userName = storage.get("userName") || "User";
  const userEmail = storage.get("userEmail") || "No email";
  const userId = storage.get("id") || "N/A";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* User Avatar and Name */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full border border-blue-200">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {userName}
                    </h3>
                    <p className="text-sm text-gray-500">Administrator</p>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-900">{userName}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User ID
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-900">{userId}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-900">{userEmail}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings Card */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Account Settings
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Change Password
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Update your password to keep your account secure
                    </p>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member since</span>
                  <span className="text-sm text-gray-900">2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last login</span>
                  <span className="text-sm text-gray-900">Recently</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  Privacy settings
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  Notification preferences
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  Help & Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </div>
  );
};

export default ProfilePage;
