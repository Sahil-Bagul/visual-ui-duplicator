
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { UserCircle2, LogOut } from 'lucide-react';

const HeaderWithNotifications: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-[993px] mx-auto flex justify-between items-center p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img
            src="/public/assets/learnandearn-logo.png"
            alt="Learn & Earn"
            className="h-8"
          />
          <span className="font-medium text-gray-900">Learn & Earn</span>
        </Link>

        <div className="flex items-center gap-2">
          <NotificationCenter />
          
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
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeaderWithNotifications;
