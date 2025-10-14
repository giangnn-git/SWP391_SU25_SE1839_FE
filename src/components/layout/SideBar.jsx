import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  LayoutDashboard,
  ShieldCheck,
  Car,
  CheckCircle2,
  PackageSearch,
  BarChart3,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = () => {
  const { currentUser, loading } = useCurrentUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = currentUser?.role === "ADMIN";
  const isEvmStaff = currentUser?.role === "EVM_STAFF";

  const navigation = [
    { name: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
    { name: "Warranty Claims", href: "/warranty-claims", icon: <ShieldCheck size={18} /> },
    { name: "Repair Orders", href: "/repair-orders", icon: <Car size={18} /> },
    { name: "Claim Approval", href: "/approvals", icon: <CheckCircle2 size={18} /> },
    { name: "Supply Chain", href: "/supply-chain", icon: <PackageSearch size={18} /> },
    { name: "Analytics & Reports", href: "/analytics", icon: <BarChart3 size={18} /> },
    ...(isAdmin || isEvmStaff ? [{ name: "Policy", href: "/policy", icon: <FileText size={18} /> }] : []),
    ...(isAdmin ? [{ name: "User Management", href: "/manage-users", icon: <Users size={18} /> }] : []),
  ];

  if (loading)
    return (
      <div className="w-64 bg-white shadow-lg h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div
      className={`bg-white/80 backdrop-blur-md shadow-xl border-r border-gray-200 h-full flex flex-col transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        {!isCollapsed && (
          <div>
            <h1 className="text-lg font-semibold text-gray-900">⚡ EV Warranty</h1>
            <p className="text-xs text-gray-600">Management System</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 transition"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150 
                  ${isActive
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-medium border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`
                }
              >
                <div className="p-1.5 rounded-md bg-gray-100 text-gray-600">{item.icon}</div>
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-600">
          <p>EV Motors Corp</p>
          <p className="mt-1 text-gray-400 capitalize">{currentUser?.role?.toLowerCase()}</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
