import { NavLink } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const Sidebar = () => {
  const { currentUser, loading } = useCurrentUser();

  const isAdmin = currentUser?.role === "ADMIN";
  const isEvmStaff = currentUser?.role === "EVM_STAFF";
  const navigation = [
    { name: "Dashboard", href: "/", icon: "📊" },
    { name: "Warranty Claims", href: "/warranty-claims", icon: "🛡️" },
    { name: "Vehicles", href: "/vehicles", icon: "🚗" },
    { name: "Claim Approval", href: "/approvals", icon: "✅" },
    // { name: "Supply Chain", href: "/supply-chain", icon: "🔗" },
    // { name: "Analytics & Reports", href: "/analytics", icon: "📈" },
    ...(isAdmin || isEvmStaff
      ? [
        { name: "Supply Chain", href: "/supply-chain", icon: "🔗" },
        { name: "Part Warranty Policies", href: "/part-policies", icon: "📜" },
      ]
      : []),
    { name: "Analytics & Reports", href: "/analytics", icon: "📈" },
    ...(isAdmin
      ? [{ name: "User Management", href: "/manage-users", icon: "👥" }]
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
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900 mb-2">EV Warranty</h1>
        <p className="text-sm text-gray-600">Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Dashboard
          </h3>
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <span className="mr-3 text-base">{item.icon}</span>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <p className="text-xs text-gray-500 text-center">EV Motors Corp</p>
        <p className="text-xs text-gray-400 text-center mt-1 capitalize">
          {currentUser?.role?.toLowerCase()}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
