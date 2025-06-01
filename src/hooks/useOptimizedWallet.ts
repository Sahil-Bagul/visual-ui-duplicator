
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface WalletData {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  payoutMethods: Array<{
    id: string;
    method_type: string;
    upi_id: string | null;
    account_number: string | null;
    is_default: boolean;
  }>;
}

export const useOptimizedWallet = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async (): Promise<WalletData> => {
      if (!user) throw new Error('User not authenticated');

      const [walletResponse, payoutMethodsResponse] = await Promise.all([
        supabase
          .from('wallet')
          .select('balance, total_earned, total_withdrawn')
          .eq('user_id', user.id)
          .maybeSingle(),
        
        supabase
          .from('payout_methods')
          .select('id, method_type, upi_id, bank_account_number, is_default')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })
      ]);

      if (walletResponse.error) throw walletResponse.error;
      if (payoutMethodsResponse.error) throw payoutMethodsResponse.error;

      const walletData = walletResponse.data;
      const payoutMethods = (payoutMethodsResponse.data || []).map(method => ({
        ...method,
        account_number: method.bank_account_number
      }));

      return {
        balance: walletData?.balance || 0,
        totalEarned: walletData?.total_earned || 0,
        totalWithdrawn: walletData?.total_withdrawn || 0,
        payoutMethods
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
