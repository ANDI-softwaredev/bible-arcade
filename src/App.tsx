
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Import pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import Study from "./pages/Study";
import BibleStudy from "./pages/BibleStudy";
import CustomQuiz from "./pages/CustomQuiz";
import MobileAR from "./pages/MobileAR";
import NotFound from "./pages/NotFound";

// Auth guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary/50 border-t-primary rounded-full"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login but save the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Redirect when already authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Get redirect destination from state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary/50 border-t-primary rounded-full"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  
  return <>{children}</>;
};

// Routes Component with ThemeProvider correctly applied
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/progress" element={
        <ProtectedRoute>
          <Progress />
        </ProtectedRoute>
      } />
      <Route path="/study" element={
        <ProtectedRoute>
          <Study />
        </ProtectedRoute>
      } />
      <Route path="/bible-study" element={
        <ProtectedRoute>
          <BibleStudy />
        </ProtectedRoute>
      } />
      <Route path="/custom-quiz" element={
        <ProtectedRoute>
          <CustomQuiz />
        </ProtectedRoute>
      } />
      <Route path="/mobile-ar" element={
        <ProtectedRoute>
          <MobileAR />
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Move this inside the component to fix the React hooks issue
const App = () => {
  // Create a new query client inside the component
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <AnimatePresence mode="wait">
                <AppRoutes />
              </AnimatePresence>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
