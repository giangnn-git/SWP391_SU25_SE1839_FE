import { Navigate, useLocation } from "react-router-dom";
import { storage } from "../../utils/storage";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useState, useEffect } from "react";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { currentUser, loading } = useCurrentUser();

  // ✅ Hook luôn gọi ở đầu
  const [accessDenied, setAccessDenied] = useState(false);

  const isLoggedIn = storage.get("isLoggedIn");
  const requiresPasswordChange = storage.get("requiresPasswordChange");

  // 🧭 Kiểm tra quyền trong useEffect để không ảnh hưởng hook order
  useEffect(() => {
    if (loading || !currentUser) return;

    const userRole = currentUser.role?.toUpperCase();
    const path = location.pathname;
    let allowed = true;

    // Kiểm tra theo danh sách allowedRoles
    const hasAccess =
      allowedRoles.length === 0 || allowedRoles.includes(userRole);

    // Quy định đặc biệt
    if (path.startsWith("/approvals")) {
      allowed = userRole === "ADMIN" || userRole === "EVM_STAFF";
    }

    if (path.startsWith("/vehicles")) {
      allowed = userRole === "ADMIN" || userRole === "EVM_STAFF";
    }

    // Nếu không đủ quyền
    if (!hasAccess || !allowed) {
      setAccessDenied(true);
    } else {
      setAccessDenied(false);
    }
  }, [allowedRoles, currentUser, location.pathname, loading]);

  // 🕒 Redirect khi accessDenied
  useEffect(() => {
    if (accessDenied) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [accessDenied]);

  // ✅ Loading user info
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading user information...
      </div>
    );
  }

  // ✅ Nếu chưa đăng nhập
  if (!isLoggedIn || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Cần đổi mật khẩu
  if (
    requiresPasswordChange === true &&
    location.pathname !== "/change-password"
  ) {
    return <Navigate to="/change-password" replace />;
  }

  // ✅ Đã đổi mật khẩu mà vẫn ở /change-password
  if (
    requiresPasswordChange === false &&
    location.pathname === "/change-password"
  ) {
    return <Navigate to="/" replace />;
  }

  // ✅ Access Denied giao diện
  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50 text-gray-700">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md border border-gray-200">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            🚫 Access Denied
          </h2>
          <p className="text-sm text-gray-600">
            You do not have permission to access this page.
          </p>
          <p className="text-xs text-gray-400 mt-3 italic">
            Redirecting to Dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Render nội dung nếu hợp lệ
  return children;
};

export default PrivateRoute;
