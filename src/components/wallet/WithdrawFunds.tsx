
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import PayoutMethodsList from './PayoutMethodsList';

interface WithdrawFundsProps {
  balance: number;
  onWithdrawSuccess: () => void;
}

const WithdrawFunds: React.FC<WithdrawFundsProps> = ({ balance, onWithdrawSuccess }) => {
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
  
  if (balance < 250) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mt-4">
        <p className="font-medium">Minimum withdrawal amount is ₹250</p>
        <p className="text-sm mt-1">Your current balance is ₹{balance}. Earn more to withdraw.</p>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={handleWithdraw}
        disabled={isProcessing}
        className="w-full bg-[#00C853] hover:bg-[#00B248] text-white mt-4"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Withdraw ₹${balance} Now`
        )}
      </Button>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payout Method</DialogTitle>
            <DialogDescription>
              You need to add a payout method before you can withdraw funds.
            </DialogDescription>
          </DialogHeader>
          <PayoutMethodsList />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WithdrawFunds;
