
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useEffect, useState } from "react";
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
import Feedback from "./pages/Feedback";
import { initializeAppData } from "./utils/autoSetupCourses";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize course data when the app loads but don't show loading screen for too long
  useEffect(() => {
    const setupCourses = async () => {
      try {
        console.log("Starting app initialization...");
        // Set a timeout to ensure the loading screen doesn't show for too long
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));
        
        // Run course initialization in parallel with the timeout
        const [result] = await Promise.all([
          initializeAppData(),
          timeoutPromise
        ]);
        
        console.log("App initialization result:", result);
        if (!result.success) {
          console.error("App initialization failed:", result.error);
        }
      } catch (error) {
        console.error("Error initializing app data:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    setupCourses();
  }, []);

  // Show a simpler loading indicator during initialization
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
                <Route path="/feedback" element={<Feedback />} />
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
