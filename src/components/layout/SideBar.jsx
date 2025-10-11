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
} from "lucide-react";

const Sidebar = () => {
  const { currentUser, loading } = useCurrentUser();

  const isAdmin = currentUser?.role === "ADMIN";
  const isEvmStaff = currentUser?.role === "EVM_STAFF";

  const navigation = [
    { name: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
    {
      name: "Warranty Claims",
      href: "/warranty-claims",
      icon: <ShieldCheck size={18} />,
    },
    { name: "Vehicles", href: "/vehicles", icon: <Car size={18} /> },
    {
      name: "Claim Approval",
      href: "/approvals",
      icon: <CheckCircle2 size={18} />,
    },
    {
      name: "Supply Chain",
      href: "/supply-chain",
      icon: <PackageSearch size={18} />,
    },
    {
      name: "Analytics & Reports",
      href: "/analytics",
      icon: <BarChart3 size={18} />,
    },
    ...(isAdmin || isEvmStaff
      ? [{ name: "Policy", href: "/policy", icon: <FileText size={18} /> }]
      : []),
    ...(isAdmin
      ? [
          {
            name: "User Management",
            href: "/manage-users",
            icon: <Users size={18} />,
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="w-64 bg-white shadow-lg h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white/80 backdrop-blur-md shadow-xl border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <h1 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight flex items-center gap-2">
          ⚡ EV Warranty
        </h1>
        <p className="text-sm text-gray-600">Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main Menu
          </h3>
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-r-2 border-blue-600 font-medium shadow-sm"
                      : "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }
                >
                  <div
                    className={`p-1.5 rounded-md ${
                      item.isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 group-hover:bg-blue-50"
                    }`}
                  >
                    {item.icon}
                  </div>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white/60 backdrop-blur-sm">
        <p className="text-xs text-gray-600 text-center font-medium">
          EV Motors Corp
        </p>
        <p className="text-xs text-gray-400 text-center mt-1 capitalize">
          {currentUser?.role?.toLowerCase()}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
