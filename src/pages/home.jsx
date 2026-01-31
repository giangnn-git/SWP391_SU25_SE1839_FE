// src/pages/home.jsx
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

export default function HomePage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>Home (tạm)</h2>
            <button
                onClick={handleLogout}
                style={{ padding: "8px 14px", background: "black", color: "white", borderRadius: 6 }}
            >
                Logout
            </button>
        </div>
    );
}