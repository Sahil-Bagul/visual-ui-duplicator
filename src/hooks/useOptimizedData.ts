
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Optimized hook for dashboard data
export const useOptimizedDashboardData = (userId: string) => {
  return useQuery({
    queryKey: ['dashboard-data', userId],
    queryFn: async () => {
      const [coursesResult, purchasesResult, walletResult] = await Promise.all([
        supabase.from('courses').select('*').eq('is_active', true),
        supabase.from('purchases').select('*, courses(title)').eq('user_id', userId).eq('payment_status', 'completed'),
        supabase.from('wallet').select('*').eq('user_id', userId).single()
      ]);

      return {
        courses: coursesResult.data || [],
        purchases: purchasesResult.data || [],
        wallet: walletResult.data || { balance: 0, total_earned: 0, total_withdrawn: 0 }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  });
};

// Optimized hook for referral data
export const useOptimizedReferralData = (userId: string) => {
  return useQuery({
    queryKey: ['referral-data', userId],
    queryFn: async () => {
      const [purchasesResult, referralsResult] = await Promise.all([
        supabase
          .from('purchases')
          .select('course_id, courses(id, title)')
          .eq('user_id', userId)
          .eq('payment_status', 'completed'),
        supabase
          .from('referrals')
          .select('*')
          .eq('user_id', userId)
      ]);

      return {
        purchases: purchasesResult.data || [],
        referrals: referralsResult.data || []
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!userId,
  });
};

// Optimized support tickets hook
export const useOptimizedSupportTickets = () => {
  return useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          users!support_tickets_user_id_fkey(email, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds for real-time feel
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
};
