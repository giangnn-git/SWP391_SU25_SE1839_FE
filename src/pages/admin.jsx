// src/pages/admin.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import { storage } from "../utils/storage";

function StatCard({ title, value, sub }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition">
            <div className="text-sm text-slate-500">{title}</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
            {sub ? <div className="mt-1 text-xs text-slate-500">{sub}</div> : null}
        </div>
    );
}

function NavItem({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={[
                "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100",
            ].join(" ")}
            type="button"
        >
            <span
                className={[
                    "h-2 w-2 rounded-full",
                    active ? "bg-white" : "bg-slate-300",
                ].join(" ")}
            />
            {label}
        </button>
    );
}

export default function AdminPage() {
    const navigate = useNavigate();

    const userName = storage.get("userName") || "Admin";
    const userEmail = storage.get("userEmail") || "admin@example.com";

    const stats = useMemo(
        () => [
            { title: "Total Users", value: "128", sub: "Last 30 days" },
            { title: "Active Requests", value: "23", sub: "Need review" },
            { title: "Service Centers", value: "7", sub: "Connected" },
            { title: "System Health", value: "Good", sub: "All services normal" },
        ],
        []
    );

    const activities = useMemo(
        () => [
            { time: "09:12", text: "New user registered: team_member01" },
            { time: "10:05", text: "Warranty request #1024 submitted" },
            { time: "11:20", text: "Service center updated profile information" },
            { time: "13:40", text: "Admin reviewed request #1018" },
        ],
        []
    );

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Layout */}
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                    <div className="flex grow flex-col gap-y-5 border-r border-slate-200 bg-white px-4 py-5">
                        {/* Brand */}
                        <div className="flex items-center gap-3 px-2">
                            <div className="h-10 w-10 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="text-slate-800"
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
                            <div>
                                <div className="text-sm font-semibold text-slate-900">
                                    SWP391 Admin
                                </div>
                                <div className="text-xs text-slate-500">Dashboard</div>
                            </div>
                        </div>

                        {/* Nav */}
                        <nav className="flex flex-col gap-2">
                            <NavItem label="Overview" active onClick={() => { }} />
                            <NavItem label="Users" onClick={() => { }} />
                            <NavItem label="Requests" onClick={() => { }} />
                            <NavItem label="Service Centers" onClick={() => { }} />
                            <NavItem label="Settings" onClick={() => { }} />
                        </nav>

                        {/* Footer */}
                        <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            <div className="text-xs text-slate-500">Signed in as</div>
                            <div className="mt-1 text-sm font-semibold text-slate-900 truncate">
                                {userName}
                            </div>
                            <div className="text-xs text-slate-600 truncate">{userEmail}</div>

                            <button
                                onClick={handleLogout}
                                className="mt-3 w-full rounded-xl bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
                                type="button"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 md:pl-64">
                    {/* Topbar */}
                    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
                        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Overview</h1>
                                <p className="text-sm text-slate-600">
                                    Welcome back, <span className="font-semibold">{userName}</span>
                                </p>
                            </div>

                            {/* Right actions */}
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:block">
                                    <div className="text-xs text-slate-500 text-right">Role</div>
                                    <div className="text-sm font-semibold text-slate-900">
                                        ADMIN
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="md:hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
                                    type="button"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((s) => (
                                <StatCard
                                    key={s.title}
                                    title={s.title}
                                    value={s.value}
                                    sub={s.sub}
                                />
                            ))}
                        </div>

                        {/* Panels */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Recent activities */}
                            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Recent Activities
                                    </h2>
                                    <button
                                        className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                                        type="button"
                                        onClick={() => { }}
                                    >
                                        View all
                                    </button>
                                </div>

                                <div className="mt-4 divide-y divide-slate-100">
                                    {activities.map((a, idx) => (
                                        <div key={idx} className="py-3 flex gap-4">
                                            <div className="w-14 text-xs text-slate-500">{a.time}</div>
                                            <div className="text-sm text-slate-800">{a.text}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick actions */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h2 className="text-base font-semibold text-slate-900">
                                    Quick Actions
                                </h2>

                                <div className="mt-4 space-y-3">
                                    <button
                                        type="button"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 transition"
                                        onClick={() => { }}
                                    >
                                        <div className="text-sm font-semibold text-slate-900">
                                            Create user
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Add a new account quickly
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 transition"
                                        onClick={() => { }}
                                    >
                                        <div className="text-sm font-semibold text-slate-900">
                                            Review requests
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Check pending warranty requests
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 transition"
                                        onClick={() => { }}
                                    >
                                        <div className="text-sm font-semibold text-slate-900">
                                            System settings
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Manage configuration & roles
                                        </div>
                                    </button>
                                </div>

                                <div className="mt-5 rounded-2xl bg-slate-900 p-4 text-white">
                                    <div className="text-sm font-semibold">Tip</div>
                                    <div className="mt-1 text-xs text-white/80">
                                        Sau này bạn có thể tách route theo role: /admin, /lecturer,
                                        /leader, /member.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-xs text-slate-500 py-4">
                            © {new Date().getFullYear()} SWP391 Admin Dashboard
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}