import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userLoginApi } from "../services/api.service";

const LoginPage = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await userLoginApi(user, password);

      const token = res.data?.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("userEmail", user);
        localStorage.setItem("isLoggedIn", "true");
        navigate("/", { replace: true });
      } else {
        setError("Token not received from server!");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Login failed!");
      } else if (err.request) {
        setError("Cannot connect to server. Please try again later!");
      } else {
        setError("Unexpected error: " + err.message);
      }
      console.error("Login error:", err);
    }
  };

  return (
    <div>
      <h2>Login Page</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default LoginPage;
