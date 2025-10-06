import { Navigate } from "react-router-dom";
import { storage } from "../../utils/storage";

const PrivateRoute = ({ children }) => {
  const isLoggedIn = storage.get("isLoggedIn");

  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
