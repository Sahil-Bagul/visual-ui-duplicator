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
import AdminPanel from "./pages/AdminPanel";
import { initializeAppData } from "./utils/autoSetupCourses";
import { useAuth } from "./context/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// AppInitializer component to handle initialization after auth is loaded
const AppInitializer: React.FC = () => {
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Always initialize app data (courses)
        await initializeAppData();
        
        // Demo access code removed - now managed manually through database entries
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setInitialized(true);
      }
    };
    
    initialize();
  }, [user]);

  return null;
};

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  // Show a shorter loading screen and initialize in the background
  useEffect(() => {
    // Set a timeout to ensure the loading screen doesn't show for too long
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Show a simpler loading indicator during initialization
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading Learn & Earn...</p>
        </div>
      </div>
    );
  }

  // Add the login logger hook to track user logins for analytics
  useLoginLogger(user?.id, !!user);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppInitializer />
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
                <Route path="/admin" element={<AdminPanel />} />
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
