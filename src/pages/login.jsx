import { useId, useState } from "react";
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

      const phone = data.phone;
      const requiresPasswordChange = data.requiresPasswordChange;
      const scName = data.scName;

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

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center">
      {/* ======= ULTRA AURORA NEBULA BACKGROUND (UI only) ======= */}
      <style>{`
        @keyframes auroraMoveA {
          0% { transform: translate3d(-10%, -10%, 0) scale(1); filter: hue-rotate(0deg); }
          50% { transform: translate3d(5%, 5%, 0) scale(1.05); filter: hue-rotate(25deg); }
          100% { transform: translate3d(-10%, -10%, 0) scale(1); filter: hue-rotate(0deg); }
        }
        @keyframes auroraMoveB {
          0% { transform: translate3d(8%, 12%, 0) scale(1); filter: hue-rotate(360deg); }
          50% { transform: translate3d(-4%, -6%, 0) scale(1.08); filter: hue-rotate(310deg); }
          100% { transform: translate3d(8%, 12%, 0) scale(1); filter: hue-rotate(360deg); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-40%) skewX(-20deg); opacity: 0; }
          30% { opacity: .18; }
          100% { transform: translateX(140%) skewX(-20deg); opacity: 0; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: .3; }
          50% { opacity: .8; }
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora-anim { animation: none !important; transform: none !important; }
        }
      `}</style>

      {/* Deep space base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 800px at 50% 20%, rgba(59,130,246,0.4), transparent 60%),\
             radial-gradient(1000px 800px at 10% 80%, rgba(14,165,233,0.3), transparent 60%),\
             radial-gradient(1000px 900px at 90% 70%, rgba(168,85,247,0.25), transparent 70%),\
             linear-gradient(135deg, #030712 0%, #0b1224 40%, #0f172a 100%)",
        }}
      />

      {/* Color-shifting aurora waves */}
      <div
        className="absolute -top-40 -left-40 w-[80rem] h-[40rem] rounded-full blur-[140px] aurora-anim"
        style={{
          background:
            "linear-gradient(120deg, rgba(99,102,241,0.5), rgba(56,189,248,0.4), rgba(236,72,153,0.3))",
          opacity: 0.6,
          animation: "auroraMoveA 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 right-[-20%] w-[70rem] h-[35rem] rounded-full blur-[120px] aurora-anim"
        style={{
          background:
            "linear-gradient(90deg, rgba(14,165,233,0.45), rgba(99,102,241,0.4), rgba(168,85,247,0.35))",
          opacity: 0.6,
          animation: "auroraMoveB 30s ease-in-out infinite",
        }}
      />

      {/* Distant star dust */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(2px 2px at 10% 20%, rgba(255,255,255,0.25), transparent 50%),\
             radial-gradient(2px 2px at 70% 80%, rgba(255,255,255,0.2), transparent 50%),\
             radial-gradient(1.5px 1.5px at 40% 50%, rgba(255,255,255,0.18), transparent 50%)",
          animation: "twinkle 8s ease-in-out infinite",
          opacity: 0.8,
        }}
      />

      {/* Shimmer sweep */}
      <div
        className="absolute inset-y-0 -left-1/3 w-1/2 aurora-anim"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%)",
          filter: "blur(18px)",
          animation: "shimmerSweep 14s linear infinite",
        }}
      />

      {/* Holographic grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.1] mix-blend-screen"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),\
             linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at 50% 45%, black 70%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 45%, black 70%, transparent 90%)",
        }}
      />
      {/* ======= /END BACKGROUND ======= */}

      {/* Header / Logo */}
      <div className="relative mt-14 sm:mt-20 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur-lg opacity-75"></div>
          <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
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
              className="lucide lucide-car mx-auto h-12 w-12 text-cyan-400"
              aria-hidden="true"
            >
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="2"></circle>
              <path d="M9 17h6"></path>
              <circle cx="17" cy="17" r="2"></circle>
            </svg>
          </div>
        </div>

        <h2 className="mt-8 text-center text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          EV Warranty System
        </h2>
        <p className="mt-3 text-center text-lg text-slate-300/80 font-light">
          Welcome back! Please sign in to your account
        </p>
      </div>

      {/* Card */}
      <div className="relative mt-8 w-full max-w-md px-4 sm:px-0">
        <div className="bg-slate-800/60 backdrop-blur-xl py-10 px-8 shadow-2xl sm:rounded-3xl border border-slate-700/50 relative">
          {/* subtle glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-sm pointer-events-none"></div>

          <form className="space-y-6 relative" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl placeholder-slate-400 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300"
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
                  className="w-full px-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl placeholder-slate-400 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 backdrop-blur-sm">
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
                  <div className="text-sm text-red-300 font-medium">{error}</div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
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
                className="font-medium text-cyan-400 hover:text-cyan-300 focus:outline-none focus:underline transition-colors duration-200"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-indigo-100/70">
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
