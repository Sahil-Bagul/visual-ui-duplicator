
import { supabase } from '@/integrations/supabase/client';

export interface WalletData {
  id: string;
  user_id: string;
  total_earned: number;
  balance: number;
  total_withdrawn: number;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string | null;
  reference_id: string | null;
  status: string;
  created_at: string;
}

// Get user's wallet data
export async function getUserWallet(): Promise<WalletData | null> {
  try {
    console.log('Fetching wallet data...');
    
    const { data, error } = await supabase
      .from('wallet')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (error) {
      console.error('Error fetching wallet:', error);
      return null;
    }

    console.log('Successfully fetched wallet data:', data);
    return data as WalletData;
  } catch (error) {
    console.error('Exception fetching wallet:', error);
    return null;
  }
}

// Get user's wallet transactions
export async function getWalletTransactions(): Promise<WalletTransaction[]> {
  try {
    console.log('Fetching wallet transactions...');
    
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    console.log('Successfully fetched wallet transactions:', data?.length || 0);
    return data as WalletTransaction[];
  } catch (error) {
    console.error('Exception fetching transactions:', error);
    return [];
  }
}

// Update wallet balance
export async function updateWalletBalance(
  userId: string,
  amount: number,
  type: 'credit' | 'debit'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('update_wallet_balance', {
      user_id: userId,
      amount: amount,
      transaction_type: type
    });

    if (error) {
      console.error('Error updating wallet balance:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception updating wallet balance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
