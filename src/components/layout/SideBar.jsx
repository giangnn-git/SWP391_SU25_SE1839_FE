import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  LayoutDashboard,
  ShieldCheck,
  Car,
  Wrench,
  PackageSearch,
  BarChart3,
  FileText,
  Users,
  PanelLeft,
  PanelRight,
  AlertTriangle,
  UserPlus,
  Truck,
  Package,
  CheckCircle,
} from "lucide-react";

const Sidebar = () => {
  const { currentUser, loading } = useCurrentUser();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = currentUser?.role === "ADMIN";
  const isEvmStaff = currentUser?.role === "EVM_STAFF";
  const isScStaff = currentUser?.role === "SC_STAFF";
  const isTech = currentUser?.role === "TECHNICIAN";

  //  Style đồng bộ cho icon
  const iconStyle = "text-gray-600 group-hover:text-blue-600 transition-colors";

  const navigation = [
    // Dashboard always first
    {
      name: "Dashboard",
      href: "/",
      icon: (
        <LayoutDashboard size={18} className={iconStyle} strokeWidth={1.8} />
      ),
    },

    // Customer Registration — only SC Staff — right after Dashboard
    ...(isScStaff
      ? [
          {
            name: "Customer Registration",
            href: "/customer-registration",
            icon: (
              <UserPlus size={18} className={iconStyle} strokeWidth={1.8} />
            ),
          },
        ]
      : []),

    // Warranty Claims — chỉ dành cho SC Staff
    ...(isScStaff || isTech
      ? [
          {
            name: "Warranty Claims",
            href: "/warranty-claims",
            icon: (
              <ShieldCheck size={18} className={iconStyle} strokeWidth={1.8} />
            ),
          },
        ]
      : []),

    // Repair Orders — chỉ dành cho SC Staff
    ...(isScStaff || isTech
      ? [
          {
            name: "Repair Orders",
            href: "/repair-orders",
            icon: <Wrench size={18} className={iconStyle} strokeWidth={1.8} />,
          },
        ]
      : []),

    // Campaign Recall – Vehicles (SC Staff only)
    ...(isScStaff
      ? [
          {
            name: "Campaign Recall – Vehicles",
            href: "/sc/campaign-vehicles",
            icon: (
              <AlertTriangle
                size={18}
                className={iconStyle}
                strokeWidth={1.8}
              />
            ),
          },
        ]
      : []),

    //Warranty Claims Approval - for EVM Staff
    ...(isEvmStaff
      ? [
          {
            name: "Claim Approvals",
            href: "/warranty-claim-approvals",
            icon: (
              <CheckCircle size={18} className={iconStyle} strokeWidth={1.8} />
            ),
          },
        ]
      : []),

    // Part Requests — chỉ dành cho SC Staff (đã đổi icon thành Package)
    ...(isScStaff
      ? [
          {
            name: "Part Requests",
            href: "/part-requests",
            icon: <Package size={18} className={iconStyle} strokeWidth={1.8} />,
          },
        ]
      : []),

    // Rest of your existing navigation items...
    // Vehicle Management (Admin + EVM)
    ...(isAdmin || isEvmStaff
      ? [
          {
            name: "Vehicle Management",
            href: "/vehicles",
            icon: <Car size={18} className={iconStyle} strokeWidth={1.8} />,
          },
        ]
      : []),

    // CAMPAIGN MANAGEMENT (Admin + EVM)
    ...(isAdmin || isEvmStaff
      ? [
          {
            name: "Campaign Management",
            href: "/campaigns",
            icon: (
              <AlertTriangle
                size={18}
                className={iconStyle}
                strokeWidth={1.8}
              />
            ),
          },
        ]
      : []),

    // Supply Chain — Hidden from SC_STAFF
    ...(isAdmin || isEvmStaff || isScStaff
      ? [
          {
            name: "Supply Chain",
            href: "/supply-chain",
            icon: <Truck size={18} className={iconStyle} strokeWidth={1.8} />,
          },
        ]
      : []),

    // Analytics & Reports — only Admin & EVM Staff
    // ...(isAdmin || isEvmStaff
    //   ? [
    //     {
    //       name: "Analytics & Reports",
    //       href: "/analytics",
    //       icon: (
    //         <BarChart3 size={18} className={iconStyle} strokeWidth={1.8} />
    //       ),
    //     },
    //   ]
    //   : []),

    // Part Request Review — only EVM Staff
    ...(isEvmStaff
      ? [
          {
            name: "Part Request Review",
            href: "/part-requests-review",
            icon: (
              <PackageSearch
                size={18}
                className={iconStyle}
                strokeWidth={1.8}
              />
            ),
          },
        ]
      : []),

    // Policy — Admin & EVM Staff
    ...(isAdmin || isEvmStaff
      ? [
          {
            name: "Policy",
            href: "/policy",
            icon: (
              <FileText size={18} className={iconStyle} strokeWidth={1.8} />
            ),
          },
        ]
      : []),

    // User Management — only Admin
    ...(isAdmin
      ? [
          {
            name: "User Management",
            href: "/manage-users",
            icon: <Users size={18} className={iconStyle} strokeWidth={1.8} />,
          },
        ]
      : []),
  ];

  if (loading)
    return (
      <div className="w-64 bg-white shadow-lg h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div
      className={`transition-all duration-500 bg-white/50 backdrop-blur-xl border-r border-gray-200/70 shadow-lg h-full flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="relative p-6 border-b border-gray-200/60 bg-gradient-to-r from-blue-50/60 to-blue-100/40 flex items-center justify-between backdrop-blur-md">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight flex items-center gap-2">
              ⚡ EV Warranty
            </h1>
            <p className="text-sm text-gray-600">Management System</p>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-5 top-6 p-2 rounded-full shadow-lg border border-white/60 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-[0_0_10px_rgba(59,130,246,0.4)]"
          style={{
            boxShadow:
              "0 0 10px rgba(96,165,250,0.25), inset 0 0 5px rgba(255,255,255,0.2)",
          }}
        >
          {collapsed ? (
            <PanelRight size={18} className="text-blue-600" />
          ) : (
            <PanelLeft size={18} className="text-blue-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          {!collapsed && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main Menu
            </h3>
          )}
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name} title={collapsed ? item.name : ""}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-r-2 border-blue-600 font-medium shadow-sm"
                      : "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150 text-gray-700 hover:bg-white/60 hover:text-blue-600 hover:shadow-sm"
                  }
                >
                  <div
                    className={`p-1.5 rounded-md transition-all duration-300 ${
                      item.isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100/70 text-gray-600 group-hover:bg-blue-50"
                    }`}
                  >
                    {item.icon}
                  </div>
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
