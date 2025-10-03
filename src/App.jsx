import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/pages/Login';
import Register from './components/pages/Register.jsx';
import Dashboard from './components/pages/Dashboard';
import VehicleManagement from './components/pages/VehicleManagement';
import WarrantyClaims from './components/pages/WarrantyClaims';
import RepairExecution from './components/pages/RepairExecution';
import ServiceCampaigns from './components/pages/ServiceCampaigns';
import ProductManagement from './components/pages/ProductManagement';
import ClaimApproval from './components/pages/ClaimApproval';
import SupplyChain from './components/pages/SupplyChain';
import Analytics from './components/pages/Analytics';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ClaimsProvider } from './context/ClaimsContext';   // ✅ Thêm import

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

      {user && (
        <Route path="/*" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vehicles" element={<VehicleManagement />} />
          <Route path="warranty-claims" element={<WarrantyClaims />} />
          <Route path="repair-execution" element={<RepairExecution />} />
          <Route path="service-campaigns" element={<ServiceCampaigns />} />
          <Route path="product-management" element={<ProductManagement />} />
          <Route path="claim-approval" element={<ClaimApproval />} />
          <Route path="supply-chain" element={<SupplyChain />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      )}

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ClaimsProvider> {/* ✅ Bọc ClaimsProvider để WarrantyClaims và ClaimApproval có thể dùng useClaims */}
        <Router>
          <div className="min-h-screen bg-background">
            <AppRoutes />
          </div>
        </Router>
      </ClaimsProvider>
    </AuthProvider>
  );
}

export default App;
