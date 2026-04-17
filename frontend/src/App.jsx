import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Quotations from './pages/Quotations';
import QuotationBuilder from './pages/QuotationBuilder';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  if (loading) return <div className="flex h-screen items-center justify-center text-brand-600 font-semibold">Loading QuoteCraft...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const Settings = () => <div className="p-8 flex flex-col h-full"><h1 className="text-2xl font-semibold mb-4">Settings</h1><div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400">Settings page under construction...</div></div>;

export default function App() {
  const { checkAuth, loading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) return <div className="flex h-screen items-center justify-center text-brand-600 font-semibold">Loading App...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="quotations/new" element={<QuotationBuilder />} />
          <Route path="quotations/:id/edit" element={<QuotationBuilder />} />
          <Route path="clients" element={<Clients />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
