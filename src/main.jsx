import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LoginPage from "./pages/login.jsx";
import HomePage from "./pages/home.jsx";
import AdminPage from "./pages/admin.jsx";              // ✅ thêm dòng này
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      { path: "/home", element: <HomePage /> },
      { path: "/admin", element: <AdminPage /> },      // ✅ thêm route này
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);