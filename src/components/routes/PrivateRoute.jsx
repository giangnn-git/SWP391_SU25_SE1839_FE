import { Navigate, useLocation } from "react-router-dom";
import { storage } from "../../utils/storage";

const PrivateRoute = ({ children }) => {
  const location = useLocation();

  const isLoggedIn = storage.get("isLoggedIn");
  const requiresPasswordChange = storage.get("requiresPasswordChange");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (
    requiresPasswordChange === true &&
    location.pathname !== "/change-password"
  ) {
    return <Navigate to="/change-password" replace />;
  }

  if (
    requiresPasswordChange === false &&
    location.pathname === "/change-password"
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
