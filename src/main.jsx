import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login.jsx";
import PrivateRoute from "./components/routes/PrivateRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
<<<<<<< HEAD
import ManageUsers from "./pages/ManageUsers.jsx";
import Claim from "./pages/WarrantyClaims.jsx";
=======
import ManageUsers from "./pages/manageUsers.jsx";
import ProfilePage from "./pages/Profiles.jsx";
import ChangePasswordPage from "./pages/ChangePassword.jsx";
>>>>>>> origin/dev
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
        index: true, //  Home page
        element: <Dashboard />,
      },
      {
        path: "manage-users", // only admin access
        element: <ManageUsers />,
      },
      {
<<<<<<< HEAD
        path: "warranty-claims", // route cho page Claim
        element: <Claim />,
=======
        path: "profile",
        element: <ProfilePage />,
>>>>>>> origin/dev
      },
    ],
  },
  {
<<<<<<< HEAD
=======
    path: "/change-password",
    element: (
      <PrivateRoute>
        <ChangePasswordPage />
      </PrivateRoute>
    ),
  },
  {
>>>>>>> origin/dev
    path: "/login",
    element: <LoginPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
