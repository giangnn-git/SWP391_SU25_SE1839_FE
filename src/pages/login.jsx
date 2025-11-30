import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userLoginApi } from "../services/api.service";
import { storage } from "../utils/storage";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    localStorage.clear();

    try {
      const res = await userLoginApi(user, password);
      const data = res.data?.data;
      const token = data?.token;

      if (!token || typeof token !== "string") {
        setError("Invalid token received from server!");
        setLoading(false);
        return;
      }

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch (decodeError) {
        console.error("Token decode error:", decodeError);
        setError("Invalid token format!");
        setLoading(false);
        return;
      }

      const requiresPasswordChange = data.requiresPasswordChange;

      storage.set("token", token);
      storage.set("userEmail", decoded.sub);
      storage.set("isLoggedIn", true);
      storage.set("id", decoded.id || decoded.userId || "");
      storage.set("userName", decoded.name);
      storage.set("userPhone", decoded.phone);
      storage.set("serviceCenterId", decoded.serviceCenterId);
      storage.set("requiresPasswordChange", decoded.requiresPasswordChange);

      if (requiresPasswordChange === true) {
        navigate("/change-password", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        const errorData = err.response.data;
        const errorCode = errorData?.errorCode;

        if (errorCode) {
          setError(errorCode);
        } else {
          setError(err.response.data?.message || "Login failed!");
        }
      } else if (err.request) {
        setError("Cannot connect to server. Please try again later!");
      } else {
        setError("Unexpected error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center p-4">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Geometric shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-50 rounded-full mix-blend-multiply blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-50 rounded-full mix-blend-multiply blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-50 rounded-full mix-blend-multiply blur-xl opacity-70 animate-pulse delay-2000"></div>
      </div>

      {/* Header / Logo */}
      <div className="relative mb-8 flex flex-col items-center">
        <div className="relative mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-car mx-auto h-12 w-12 text-gray-700"
            >
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="2"></circle>
              <path d="M9 17h6"></path>
              <circle cx="17" cy="17" r="2"></circle>
            </svg>
          </div>
        </div>

        <h2 className="text-center text-4xl font-bold text-gray-900 mb-3">
          EV Warranty System
        </h2>
        <p className="text-center text-lg text-gray-600 font-light">
          Welcome back! Please sign in to your account
        </p>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white py-8 px-8 shadow-xl rounded-2xl border border-gray-200 relative">
          {/* Subtle top accent */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-b-lg"></div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 pr-12"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-red-700 font-medium">
                    {error}
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>

            {/* FORGOT PASSWORD LINK */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus:underline transition-colors duration-200"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} EV Warranty. All rights reserved.
        </p>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        showModal={showForgotPassword}
        onClose={handleCloseForgotPassword}
        onBackToLogin={handleBackToLogin}
      />
    </div>
  );
};

export default LoginPage;
