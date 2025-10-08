import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const RoleProtectedRoute = ({ allowedRoles, children }) => {
    const { currentUser, loading } = useCurrentUser();

    // Loading state (chờ lấy user)
    if (loading) {
        return <div className="p-6 text-center text-gray-600">Loading...</div>;
    }

    // Nếu chưa đăng nhập → về trang Login
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Nếu role không hợp lệ → quay về Dashboard
    if (!allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/" replace />;
    }

    // Nếu hợp lệ → render component con
    return children;
};

export default RoleProtectedRoute;
