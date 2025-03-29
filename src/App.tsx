
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

// Create a new query client
const queryClient = new QueryClient();

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

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
