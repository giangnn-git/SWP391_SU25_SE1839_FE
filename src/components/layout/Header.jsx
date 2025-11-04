import { useState, useRef, useEffect } from "react";
import { storage } from "../../utils/storage";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const userName = storage.get("userName") || "User";
  const { currentUser } = useCurrentUser();

  // Chuẩn hóa role: "SC_STAFF" → "Sc_staff"
  const roleRaw = currentUser?.role || "";
  const roleLabel =
    roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1).toLowerCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    storage.remove("token");
    storage.remove("userEmail");
    storage.remove("userName");
    storage.remove("isLoggedIn");
    storage.remove("id");
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex justify-between items-center h-16 px-6">
        {/* Title */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            EV Warranty Management System
          </h1>
        </div>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="text-right leading-tight">
                <p className="text-sm font-medium text-gray-900">{userName}</p>

                {/* Role badge chỉ hiển thị role */}
                {roleLabel && (
                  <span
                    className="inline-block mt-[2px] text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-[2px] rounded-full shadow-sm tracking-wide"
                    aria-label={`Role: ${roleLabel}`}
                    title={roleLabel}
                  >
                    {roleLabel}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full border border-blue-200">
                <svg
                  className="w-4 h-4 text-blue-600"
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

              {/* Chevron */}
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={handleProfile}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-3 text-gray-500"
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
                  My Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
