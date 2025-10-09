import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login.jsx";
import PrivateRoute from "./components/routes/PrivateRoute.jsx";
import SupplyChain from "./pages/SupplyChain.jsx";
import Policy from "./pages/Policy.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ManageUsers from "./pages/manageUsers.jsx";
import SupplyChain from "./pages/SupplyChain";
import PartPolicyManagement from "./pages/PartPolicyManagement.jsx";
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
        path: "policy", // Policy Management (Part + Warranty)
        element: (
          <PrivateRoute allowedRoles={["ADMIN", "EVM_STAFF"]}>
            <Policy />
          </PrivateRoute>
        ),
      },
      {
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
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
