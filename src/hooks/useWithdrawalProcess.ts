
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseWithdrawalProcessProps {
  onWithdrawSuccess: () => void;
}

export const useWithdrawalProcess = ({ onWithdrawSuccess }: UseWithdrawalProcessProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleWithdraw = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      // First, check if user has a default payout method
      const { data: payoutMethods, error: fetchError } = await supabase
        .from('payout_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();
        
      if (fetchError) {
        // No default payout method found
        setOpenDialog(true);
        setIsProcessing(false);
        return;
      }
      
      // Call the edge function to process the payout
      const { data, error } = await supabase.functions.invoke('processPayout', {
        body: { user_id: user.id }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: 'Withdrawal Request Submitted',
          description: 'Your withdrawal request has been received and will be processed within 24-48 hours.',
        });
        
        // Notify parent component about successful withdrawal submission
        onWithdrawSuccess();
      } else {
        throw new Error(data.message || 'Failed to process withdrawal');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'There was a problem processing your withdrawal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    openDialog,
    setOpenDialog,
    handleWithdraw
  };
};
