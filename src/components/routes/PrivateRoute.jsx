<<<<<<< HEAD
import { Navigate } from "react-router-dom";
import { storage } from "../../utils/storage";

const PrivateRoute = ({ children }) => {
  const isLoggedIn = storage.get("isLoggedIn");

  return isLoggedIn ? children : <Navigate to="/login" replace />;
=======
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
>>>>>>> origin/dev
};

export default PrivateRoute;
