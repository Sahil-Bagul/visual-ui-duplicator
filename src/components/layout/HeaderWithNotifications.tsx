
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { UserCircle2, LogOut, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const HeaderWithNotifications: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if the user is an admin
  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      try {
        const { data, error } = await supabase.rpc('is_user_admin', {
          user_id: user.id
        });
        
        if (error) {
          console.error('Error checking admin status:', error);
          return false;
        }
        
        return data || false;
      } catch (error) {
        console.error('Exception checking admin status:', error);
        return false;
      }
    },
    enabled: !!user?.id,
  });
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
            <Link to="/admin">
              <Button 
                variant={isOnAdminPage ? "default" : "ghost"}
                size="icon"
                title="Admin Dashboard"
                className={isOnAdminPage ? "bg-[#00C853] hover:bg-[#00A846]" : "text-[#00C853]"}
              >
                <Shield className="h-5 w-5" />
              </Button>
            </Link>
          )}
          
          <Link to="/profile">
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
