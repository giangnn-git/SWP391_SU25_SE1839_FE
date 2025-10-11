import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login.jsx";
import PrivateRoute from "./components/routes/PrivateRoute.jsx";
import SupplyChain from "./pages/SupplyChain.jsx";
import Policy from "./pages/Policy.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ManageUsers from "./pages/ManageUsers.jsx";
import WarrantyClaims from "./pages/WarrantyClaims.jsx";
import RepairOrders from "./pages/RepairOrders.jsx";
import SupplyChain from "./pages/SupplyChain.jsx";
import PartPolicyManagement from "./pages/PartPolicyManagement.jsx";
import ProfilePage from "./pages/Profiles.jsx";
import ManageUsers from "./pages/ManageUsers.jsx";
import ChangePasswordPage from "./pages/ChangePassword.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <App />
      </PrivateRoute>
    ),
    children: [
      {
        index: true, // Home page
        element: <Dashboard />,
      },
      {
        path: "warranty-claims", // only admin access
        element: <WarrantyClaims />,
      },

      {
        path: "repair-orders",
        element: <RepairOrders />,
      },
      {
        path: "supply-chain", // chỉ admin + evm staff mới truy cập được
        path: "manage-users", // Only Admin access
        element: (
          <PrivateRoute allowedRoles={["ADMIN"]}>
            <ManageUsers />
          </PrivateRoute>
        ),
      },
      {
        path: "supply-chain", //  chỉ admin + evm staff mới truy cập được
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "EVM_STAFF"]}>
            <SupplyChain />
          </PrivateRoute>
        ),
      },
      {
        path: "part-policies", // quản lý chính sách bảo hành
        path: "policy", // Policy Management (Part + Warranty)
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "EVM_STAFF"]}>
            <Policy />
          </PrivateRoute>
        ),
      },
      {
        path: "profile",
        element: <ProfilePage />,
        path: "part-policies", // Alias route: mở sẵn tab Part Policy
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "EVM_STAFF"]}>
            <Policy />
          </PrivateRoute>
        ),
      },
      {
        path: "warranty-policies", // Alias route: mở sẵn tab Warranty Policy
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "EVM_STAFF"]}>
            <Policy />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/change-password",
    element: <ChangePasswordPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
