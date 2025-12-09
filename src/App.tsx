import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AcceptInvitation from "./pages/AcceptInvitation";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import DashboardCalls from "./pages/DashboardCalls";
import DashboardCallDetail from "./pages/DashboardCallDetail";
import DashboardAnalytics from "./pages/DashboardAnalytics";
import DashboardSettings from "./pages/DashboardSettings";
import DashboardLayout from "./layouts/DashboardLayout";
import Demo from "./pages/Demo";
import Assessment from "./pages/Assessment";
import AuthCallback from "./pages/AuthCallback";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="calls" element={<DashboardCalls />} />
              <Route path="calls/:callId" element={<DashboardCallDetail />} />
              <Route path="analytics" element={<DashboardAnalytics />} />
              <Route path="settings" element={<DashboardSettings />} />
            </Route>
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
