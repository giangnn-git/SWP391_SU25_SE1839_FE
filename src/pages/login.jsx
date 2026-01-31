// src/pages/login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userLoginApi } from "../services/api.service";
import { storage } from "../utils/storage";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin1");
  const [password, setPassword] = useState("123456");
  const [loginType, setLoginType] = useState("ADMIN");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    storage.remove("token");
    storage.remove("isLoggedIn");
    storage.remove("loginType");
    storage.remove("requiresPasswordChange");

    try {
      const res = await userLoginApi(username, password, loginType);

      const payload = res?.data?.data ?? res?.data ?? {};
      const token = payload?.token;

      if (!token || typeof token !== "string") {
        setError("Invalid token received from server!");
        return;
      }

      let decoded = null;
      try {
        decoded = jwtDecode(token);
      } catch (err) {
        console.error("Token decode error:", err);
        setError("Invalid token format!");
        return;
      }

      const requiresPasswordChange =
        payload?.requiresPasswordChange ??
        decoded?.requiresPasswordChange ??
        false;

      storage.set("token", token);
      storage.set("isLoggedIn", true);
      storage.set("loginType", loginType);
      storage.set("requiresPasswordChange", !!requiresPasswordChange);

      storage.set("userEmail", decoded?.sub || "");
      storage.set("id", decoded?.id || decoded?.userId || "");
      storage.set("userName", decoded?.name || "");
      storage.set("userPhone", decoded?.phone || "");
      storage.set("serviceCenterId", decoded?.serviceCenterId || "");

      if (requiresPasswordChange) {
        navigate("/change-password", { replace: true });
        return;
      }

      if (loginType === "ADMIN") navigate("/admin", { replace: true });
      else navigate("/home", { replace: true });
    } catch (err) {
      console.error("Login error:", err);

      if (err?.response) {
        const errorData = err.response.data;
        setError(errorData?.errorCode || errorData?.message || "Login failed!");
      } else if (err?.request) {
        setError("Cannot connect to server. Please try again later!");
      } else {
        setError("Unexpected error: " + (err?.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-40" />
        <div className="absolute -top-16 -right-24 w-72 h-72 bg-cyan-200 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-24 left-10 w-72 h-72 bg-fuchsia-200 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="mb-6 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
            {/* simple icon */}
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              className="text-slate-700"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L3 6.5V17.5L12 22L21 17.5V6.5L12 2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M12 22V12.2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M21 6.5L12 12.2L3 6.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            SWP391 System
          </h1>
          <p className="mt-1 text-slate-600">
            Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <div className="flex gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 text-red-500"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // eye open
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                      <path
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ) : (
                    // eye off
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18"
                      />
                      <path
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.477 10.48a3 3 0 104.243 4.243"
                      />
                      <path
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.228 6.23C4.28 7.7 2.93 9.7 2.458 12c1.274 4.057 5.064 7 9.542 7 1.26 0 2.47-.233 3.59-.66"
                      />
                      <path
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.88 5.08A10.36 10.36 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.53 10.53 0 01-2.13 3.57"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Login Type
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900
                           focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                value={loginType}
                onChange={(e) => setLoginType(e.target.value)}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 text-white py-3 font-semibold
                         hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed
                         shadow-sm hover:shadow"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-75"
                      strokeLinecap="round"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>

            <p className="text-xs text-slate-500 text-center pt-1">
              © {new Date().getFullYear()} SWP391. All rights reserved.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}