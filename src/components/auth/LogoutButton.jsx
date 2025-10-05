import { useNavigate } from "react-router-dom";
import { storage } from "../utils/storage";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.remove("isLoggedIn");
    storage.remove("userEmail");
    storage.remove("token");
    navigate("/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
