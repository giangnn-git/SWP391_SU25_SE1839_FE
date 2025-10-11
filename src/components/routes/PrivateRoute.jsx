import { Navigate, useLocation } from "react-router-dom";
import { storage } from "../../utils/storage";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { currentUser, loading } = useCurrentUser();

  const isLoggedIn = storage.get("isLoggedIn");
  const requiresPasswordChange = storage.get("requiresPasswordChange");

  // Hiển thị khi đang tải user
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading user information...
      </div>
    );
  }

  // Nếu chưa đăng nhập → về Login
  if (!isLoggedIn || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Nếu cần đổi mật khẩu → chuyển đến trang Change Password
  if (
    requiresPasswordChange === true &&
    location.pathname !== "/change-password"
  ) {
    return <Navigate to="/change-password" replace />;
  }

  // Nếu KHÔNG cần đổi mật khẩu mà đang ở trang đổi mật khẩu → về Dashboard
  if (
    requiresPasswordChange === false &&
    location.pathname === "/change-password"
  ) {
    return <Navigate to="/" replace />;
  }

  // Nếu route yêu cầu role cụ thể mà user không đủ quyền → về Dashboard
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(currentUser.role?.toUpperCase())
  ) {
    return <Navigate to="/" replace />;
  }

  // 🔹 Bổ sung: Ràng buộc riêng cho trang Claim Approval
  // Chỉ ADMIN và EVM_STAFF mới được truy cập /approvals
  if (
    location.pathname.startsWith("/approvals") &&
    currentUser.role?.toUpperCase() !== "ADMIN" &&
    currentUser.role?.toUpperCase() !== "EVM_STAFF"
  ) {
    return <Navigate to="/" replace />;
  }

  // Tất cả điều kiện hợp lệ → render component con
  return children;
};

export default PrivateRoute;
