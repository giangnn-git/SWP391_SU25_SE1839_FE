import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../assets/css/Login.css';


const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/api/auth/token", {
        user: username,
        password: password,
      });

      console.log("Response from backend:", res.data);

      const token = res.data?.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("userEmail", username);
        localStorage.setItem("isLoggedIn", "true");

        navigate("/", { replace: true });
      } else {
        setError("Token not received from server!");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Cannot connect to server. Please try again later!");
      } else if (err.request) {
        setError("Cannot connect to server. Please try again later!");
      } else {
        setError("Unexpected error: " + err.message);
      }
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Please login to your account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Login
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default LoginPage;
