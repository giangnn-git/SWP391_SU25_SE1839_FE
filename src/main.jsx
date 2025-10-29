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
import ClaimDetail from "./pages/WarrantyClaimDetail.jsx";
import RepairOrderDetail from "./pages/RepairOrderDetail.jsx";
import ProfilePage from "./pages/Profiles.jsx";
import ChangePasswordPage from "./pages/ChangePassword.jsx";
import Profiles from "./pages/Profiles.jsx";
import VehicleManagement from "./pages/VehicleManagement.jsx";
import CampaignManagement from "./pages/CampaignManagement.jsx";
import CustomerRegistration from "./pages/CustomerRegistration.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import ClaimApprove from "./pages/ClaimApprove.jsx";
import PartRequestPage from "./pages/PartRequest.jsx";
import PartRequestReview from "./pages/PartRequestReview.jsx";
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

      //  Warranty Claims — chỉ SC_STAFF có quyền
      {
        path: "warranty-claims",
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "SC_STAFF", "TECHNICIAN", "EVM_STAFF"]}>
            <WarrantyClaims />
          </PrivateRoute>
        ),
      },

      //  Claim Detail — chỉ SC_STAFF có quyền
      {
        path: "claim/:id",
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "SC_STAFF", "EVM_STAFF"]}>
            <ClaimDetail />
          </PrivateRoute>
        ),
      },

      //  Repair Orders — chỉ SC_STAFF có quyền
      {
        path: "repair-orders",
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "SC_STAFF", "TECHNICIAN"]}>
            <RepairOrders />
          </PrivateRoute>
        ),
      },

      //  Repair Order Detail — chỉ SC_STAFF có quyền
      {
        path: "repair-orders/:id",
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "SC_STAFF", "TECHNICIAN"]}>
            <RepairOrderDetail />
          </PrivateRoute>
        ),
      },

      //  Customer Registration — chỉ SC_STAFF có quyền
      {
        path: "customer-registration",
        element: (
          <PrivateRoute allowedRoles={["SC_STAFF"]}>
            <CustomerRegistration />
          </PrivateRoute>
        ),
      },

      //  Part Requests — chỉ SC_STAFF có quyền
      {
        path: "part-requests",
        element: (
          <PrivateRoute allowedRoles={["SC_STAFF"]}>
            <PartRequestPage />
          </PrivateRoute>
        ),
      },

      //  Vehicle Management — ADMIN only
      {
        path: "vehicles",
        element: (
          <PrivateRoute allowedRoles={["ADMIN"]}>
            <VehicleManagement />
          </PrivateRoute>
        ),
      },

      //  Manage Users — ADMIN only
      {
        path: "manage-users",
        element: (
          <PrivateRoute allowedRoles={["ADMIN"]}>
            <ManageUsers />
          </PrivateRoute>
        ),
      },

      //  Supply Chain — ADMIN + EVM_STAFF only
      {
        path: "supply-chain",
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "EVM_STAFF"]}>
            <SupplyChain />
          </PrivateRoute>
        ),
      },

      //  Claim Approve — chỉ EVM_STAFF có quyền
      {
        path: "claim-approve",
        element: (
          <PrivateRoute allowedRoles={["EVM_STAFF"]}>
            <ClaimApprove />
          </PrivateRoute>
        ),
      },
      //Part Approve - chỉ EVM 
      {
        path: "part-requests-review",
        element: (
          <PrivateRoute allowedRoles={["EVM_STAFF"]}>
            <PartRequestReview />
          </PrivateRoute>
        ),
      },

      //  Policy Management (Part + Warranty) — ADMIN + EVM_STAFF only
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
        path: "warranty-policies",
        path: "policy",
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "EVM_STAFF"]}>
            <Policy />
          </PrivateRoute>
        ),
      },

      //  Campaign Management — ADMIN + EVM_STAFF only
      {
        path: "campaigns",
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "EVM_STAFF"]}>
            <CampaignManagement />
          </PrivateRoute>
        ),
      },

      // Analytics Page (chỉ Admin + EVM Staff có quyền truy cập)
      {
        path: "analytics",
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "EVM_STAFF"]}>
            <AnalyticsPage />
          </PrivateRoute>
        ),
      },
    ],
  },

  //  Trang login / profile / đổi mật khẩu
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
