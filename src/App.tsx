
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import MyCourses from "./pages/MyCourses";
import CourseDetail from "./pages/CourseDetail";
import CourseContent from "./pages/CourseContent";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import Referrals from "./pages/Referrals";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import Policies from "./pages/Policies";
import { useEffect } from "react";
import { initializeAppData } from "./utils/autoSetupCourses";

const queryClient = new QueryClient();

const App = () => {
  // Automatically initialize app data on first load
  useEffect(() => {
    const setupCourses = async () => {
      await initializeAppData(undefined);
    };
    
    setupCourses();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Auth />} />
              <Route path="/policies" element={<Policies />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-courses" element={<MyCourses />} />
                <Route path="/course/:id" element={<CourseDetail />} />
                <Route path="/course-content/:courseId" element={<CourseContent />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/referrals" element={<Referrals />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/wallet" element={<Wallet />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
