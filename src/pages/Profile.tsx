
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import HeaderWithNotifications from '@/components/layout/HeaderWithNotifications';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageCircle, LogOut, HelpCircle } from 'lucide-react';
import ContactSupportButton from '@/components/support/ContactSupportButton';
import { useQuery } from '@tanstack/react-query';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use React Query to fetch user profile data
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('users')
        .select('name, email, is_admin')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    onSuccess: (data) => {
      if (data) {
        setName(data.name || '');
        setEmail(data.email || '');
      }
    },
    onError: (error) => {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile data');
    }
  });

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('You have been signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not logged in</h1>
          <Link to="/">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = userData?.is_admin || false;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeaderWithNotifications />
      <main className="flex-grow container max-w-md mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
                disabled={isUserLoading}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                readOnly 
                disabled 
                className="w-full bg-gray-50" 
              />
              <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
            </div>

            {isAdmin && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-blue-800 font-medium">Admin Account</p>
                <p className="text-sm text-blue-600 mt-1">You have administrative privileges on this platform</p>
                <Link to="/admin">
                  <Button variant="outline" className="mt-2 w-full border-blue-200 hover:bg-blue-100">
                    Go to Admin Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              className="bg-[#00C853] hover:bg-green-600"
              onClick={handleUpdateProfile}
              disabled={isLoading || isUserLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Help & Support</h2>
          
          <div className="flex flex-col space-y-3">
            <ContactSupportButton />
            
            <Link to="/feedback">
              <Button variant="outline" className="flex items-center gap-2 w-full">
                <HelpCircle className="h-4 w-4" />
                Send Feedback
              </Button>
            </Link>
          </div>
          
          <h2 className="text-lg font-medium pt-4">Account Actions</h2>
          
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
