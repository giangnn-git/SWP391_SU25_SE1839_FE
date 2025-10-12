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
import ProfilePage from "./pages/Profiles.jsx";
import ChangePasswordPage from "./pages/ChangePassword.jsx";
import Profiles from "./pages/Profiles.jsx";
import ClaimApproval from "./pages/ClaimApproval.jsx";
import VehicleManagement from "./pages/VehicleManagement.jsx";
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
        path: "warranty-claims",
        element: <WarrantyClaims />,
      },
      {
        path: "repair-orders",
        element: <RepairOrders />,
      },

      //  Vehicle Management — Only ADMIN
      {
        path: "vehicles",
        element: (
          <PrivateRoute allowedRoles={["ADMIN"]}>
            <VehicleManagement />
          </PrivateRoute>
        ),
      },

      {
        path: "manage-users",
        element: (
          <PrivateRoute allowedRoles={["ADMIN"]}>
            <ManageUsers />
          </PrivateRoute>
        ),
      },

      {
        path: "supply-chain",
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "EVM_STAFF"]}>
            <SupplyChain />
          </PrivateRoute>
        ),
      },

      {
        path: "part-policies",
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
        path: "part-policies",
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

      //  Route for Claim Approval (ADMIN + EVM_STAFF)
      {
        path: "approvals",
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "EVM_STAFF"]}>
            <ClaimApproval />
          </PrivateRoute>
        ),
      },
    ],
  },

  //  login / profile / change-password
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/change-password",
    element: <ChangePasswordPage />,
  },
  {
    path: "/profile",
    element: <Profiles />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
