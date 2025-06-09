
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// High-performance dashboard data hook
export const useOptimizedDashboardData = (userId: string) => {
  return useQuery({
    queryKey: ['dashboard-data', userId],
    queryFn: async () => {
      if (!userId) return null;
      
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
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    enabled: !!userId,
    retry: 1, // Reduce retries for better performance
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });
};

// Optimized support tickets with better caching
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
        .order('created_at', { ascending: false })
        .limit(50); // Limit results for better performance

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    retry: 1,
  });
};

// Optimized courses hook for admin
export const useOptimizedCourses = () => {
  return useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('title');

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
