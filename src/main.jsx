import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login.jsx";
import PrivateRoute from "./components/routes/PrivateRoute.jsx";
import RoleProtectedRoute from "./components/routes/RoleProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ManageUsers from "./pages/ManageUsers.jsx";
import WarrantyClaims from "./pages/WarrantyClaims.jsx";
import RepairOrders from "./pages/RepairOrders.jsx";
import SupplyChain from "./pages/SupplyChain.jsx";
import PartPolicyManagement from "./pages/PartPolicyManagement.jsx";
import ProfilePage from "./pages/Profiles.jsx";
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
        path: "manage-users", // only admin access
        element: <ManageUsers />,
      },
      {
        path: "repair-orders",
        element: <RepairOrders />,
      },
      {
        path: "supply-chain", // chỉ admin + evm staff mới truy cập được
        element: (
          <RoleProtectedRoute allowedRoles={["ADMIN", "EVM_STAFF"]}>
            <SupplyChain />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "part-policies", // quản lý chính sách bảo hành
        element: (
          <RoleProtectedRoute allowedRoles={["ADMIN", "EVM_STAFF"]}>
            <PartPolicyManagement />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "/change-password",
    element: (
      <PrivateRoute>
        <ChangePasswordPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
