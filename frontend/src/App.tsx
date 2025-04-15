import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Contexts
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider, useData } from "./contexts/DataContext";

// Page components
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Donor pages
import DonorDashboard from "./pages/donor/DonorDashboard";

// Hospital pages
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import NewRequest from "./pages/hospital/NewRequest";
import FindDonors from "./pages/hospital/FindDonors";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageDonors from "./pages/admin/ManageDonors";
import ManageHospitals from "./pages/admin/ManageHospitals";
import RequestDetails from "./pages/admin/RequestDetails";

// Route protection
import { ReactNode } from "react";

const queryClient = new QueryClient();

// Protected Route component for role-based access
const ProtectedRoute = ({ 
  children, 
  allowedRole
}: { 
  children: ReactNode;
  allowedRole: 'donor' | 'hospital' | 'admin' | null;
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { getHospitalById } = useData();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blood-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && user?.role !== allowedRole) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'donor') {
      return <Navigate to="/donor/dashboard" replace />;
    } else if (user?.role === 'hospital') {
      return <Navigate to="/hospital/dashboard" replace />;
    } else if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }
  
  // Additional verification check for hospital routes
  if (allowedRole === 'hospital' && user?.role === 'hospital') {
    const hospital = getHospitalById(user.id);
    
    if (!hospital?.isVerified && window.location.pathname !== '/hospital/dashboard') {
      return <Navigate to="/hospital/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Donor routes */}
      <Route path="/donor/dashboard" element={
        <ProtectedRoute allowedRole="donor">
          <DonorDashboard />
        </ProtectedRoute>
      } />
      
      {/* Hospital routes */}
      <Route path="/hospital/dashboard" element={
        <ProtectedRoute allowedRole="hospital">
          <HospitalDashboard />
        </ProtectedRoute>
      } />
      <Route path="/hospital/requests/new" element={
        <ProtectedRoute allowedRole="hospital">
          <NewRequest />
        </ProtectedRoute>
      } />
      <Route path="/hospital/donors" element={
        <ProtectedRoute allowedRole="hospital">
          <FindDonors />
        </ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/donors" element={
        <ProtectedRoute allowedRole="admin">
          <ManageDonors />
        </ProtectedRoute>
      } />
      <Route path="/admin/hospitals" element={
        <ProtectedRoute allowedRole="admin">
          <ManageHospitals />
        </ProtectedRoute>
      } />
      <Route path="/admin/requests/:id" element={
        <ProtectedRoute allowedRole="admin">
          <RequestDetails />
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
