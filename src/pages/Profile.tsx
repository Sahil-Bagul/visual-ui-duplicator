
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import HeaderWithNotifications from '@/components/layout/HeaderWithNotifications';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Calendar, 
  Copy, 
  Users, 
  Award,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ContactSupportButton from '@/components/support/ContactSupportButton';
import UserSupportTickets from '@/components/support/UserSupportTickets';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  referral_code: string | null;
  joined_at: string;
  is_admin: boolean;
}

interface UserStats {
  totalReferrals: number;
  totalEarned: number;
  coursesPurchased: number;
}

const Profile: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ totalReferrals: 0, totalEarned: 0, coursesPurchased: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast.error('Failed to load profile data');
          return;
        }

        setProfile(profileData);

        // Get user stats
        const [referralsResult, walletResult, purchasesResult] = await Promise.all([
          supabase
            .from('referrals')
            .select('commission_amount', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('status', 'completed'),
          supabase
            .from('wallet')
            .select('total_earned')
            .eq('user_id', user.id)
            .single(),
          supabase
            .from('purchases')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('payment_status', 'completed')
        ]);

        const totalEarned = walletResult.data?.total_earned || 0;
        const totalReferrals = referralsResult.count || 0;
        const coursesPurchased = purchasesResult.count || 0;

        setStats({
          totalReferrals,
          totalEarned,
          coursesPurchased
        });

      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast.success('Referral code copied to clipboard!');
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <HeaderWithNotifications />
        <main className="max-w-[993px] mx-auto w-full px-6 py-8 flex-grow">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeaderWithNotifications />
      <main className="max-w-[993px] mx-auto w-full px-6 py-8 max-sm:p-4 flex-grow">
        <div className="flex items-center mb-6">
          <User className="h-8 w-8 text-[#00C853] mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          {isAdmin && (
            <Badge className="ml-4 bg-purple-100 text-purple-800 border-purple-200">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#00C853] rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profile?.name || 'User'}</h3>
                  <p className="text-gray-500 text-sm flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {profile?.email}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined {profile?.joined_at && formatDistanceToNow(new Date(profile.joined_at), { addSuffix: true })}
                </div>
                
                {profile?.referral_code && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Your Referral Code
                    </label>
                    <div className="flex items-center space-x-2">
                      <code className="bg-white px-3 py-2 rounded border font-mono text-sm flex-1">
                        {profile.referral_code}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyReferralCode}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Your Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium">Total Referrals</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">{stats.totalReferrals}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium">Total Earned</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">₹{stats.totalEarned}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium">Courses Purchased</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">{stats.coursesPurchased}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <ContactSupportButton />
            </div>
            <UserSupportTickets />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
