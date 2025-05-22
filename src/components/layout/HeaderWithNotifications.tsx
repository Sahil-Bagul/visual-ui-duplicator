
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { UserCircle2, LogOut, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const HeaderWithNotifications: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if the user is an admin with improved error handling
  const { data: isAdmin = false, error: adminCheckError } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      try {
        console.log('Checking admin status for user:', user.id);
        
        // First check the users table directly
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        if (userError) {
          console.error('Error checking admin status from users table:', userError);
          // Fall back to RPC if direct table access fails
          const { data: rpcData, error: rpcError } = await supabase.rpc('is_user_admin', {
            user_id: user.id
          });
          
          if (rpcError) {
            console.error('Error checking admin status from RPC:', rpcError);
            return false;
          }
          
          return rpcData || false;
        }
        
        return userData?.is_admin || false;
      } catch (error) {
        console.error('Exception checking admin status:', error);
        return false;
      }
    },
    enabled: !!user?.id,
    staleTime: 60000, // Cache for 1 minute
    retry: 1, // Only retry once to avoid spamming console with errors
  });
  
  // If there was an error checking admin status, log it but don't show to user
  React.useEffect(() => {
    if (adminCheckError) {
      console.error('Error checking admin status:', adminCheckError);
    }
  }, [adminCheckError]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('You have been signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  // Check if we're on the admin page already
  const isOnAdminPage = location.pathname === '/admin';

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-[993px] mx-auto flex justify-between items-center p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img
            src="/assets/learnandearn-logo.png"
            alt="Learn & Earn"
            className="h-8"
          />
          <span className="font-medium text-gray-900">Learn & Earn</span>
        </Link>

        <div className="flex items-center gap-2">
          <NotificationCenter />
          
          {isAdmin && (
            <Link to="/admin" title="Admin Dashboard">
              <Button 
                variant={isOnAdminPage ? "default" : "ghost"}
                size="icon"
                className={isOnAdminPage ? "bg-[#00C853] hover:bg-[#00A846]" : "text-[#00C853]"}
              >
                <Shield className="h-5 w-5" />
              </Button>
            </Link>
          )}
          
          <Link to="/profile" title="Profile">
            <Button variant="ghost" size="icon">
              <UserCircle2 className="h-5 w-5" />
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut className="h-5 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeaderWithNotifications;
