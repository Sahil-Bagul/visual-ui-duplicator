
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface DashboardData {
  courses: Array<{
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    price: number;
    is_active: boolean | null;
    referral_reward: number;
    isPurchased: boolean;
  }>;
  stats: {
    balance: number;
    totalEarned: number;
    coursesOwned: number;
    totalReferrals: number;
  };
}

export const useOptimizedDashboard = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!user) throw new Error('User not authenticated');

      // Single optimized query to get all needed data
      const [coursesResponse, walletResponse, purchasesResponse, referralsResponse] = await Promise.all([
        supabase
          .from('courses')
          .select('id, title, description, thumbnail_url, price, is_active, referral_reward')
          .eq('is_active', true)
          .order('title'),
        
        supabase
          .from('wallet')
          .select('balance, total_earned')
          .eq('user_id', user.id)
          .maybeSingle(),
        
        supabase
          .from('purchases')
          .select('course_id')
          .eq('user_id', user.id)
          .eq('payment_status', 'completed'),
        
        supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed')
      ]);

      if (coursesResponse.error) throw coursesResponse.error;
      if (purchasesResponse.error) throw purchasesResponse.error;

      const coursesData = coursesResponse.data || [];
      const walletData = walletResponse.data;
      const purchasesData = purchasesResponse.data || [];
      const referralsCount = referralsResponse.count || 0;

      const purchasedCourseIds = new Set(purchasesData.map(p => p.course_id));

      const courses = coursesData.map(course => ({
        ...course,
        isPurchased: purchasedCourseIds.has(course.id)
      }));

      const stats = {
        balance: walletData?.balance || 0,
        totalEarned: walletData?.total_earned || 0,
        coursesOwned: purchasedCourseIds.size,
        totalReferrals: referralsCount
      };

      return { courses, stats };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
