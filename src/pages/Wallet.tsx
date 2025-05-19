
import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import TransactionItem from '@/components/wallet/TransactionItem';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  course_title: string;
  type: string;
  date: string;
  amount: number;
  status: string;
}

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get wallet balance
        const { data: walletData, error: walletError } = await supabase
          .from('wallet')
          .select('balance')
          .eq('user_id', user.id)
          .single();
          
        if (walletError) throw walletError;
        
        if (walletData) {
          setBalance(walletData.balance);
        }
        
        // Get successful referrals as transactions
        const { data: referralsData, error: referralsError } = await supabase
          .from('referrals')
          .select(`
            successful_referrals,
            total_earned,
            courses:courses(title, referral_reward)
          `)
          .eq('user_id', user.id)
          .gt('successful_referrals', 0);
          
        if (referralsError) throw referralsError;
        
        if (referralsData && referralsData.length > 0) {
          // Convert referrals to transactions
          const referralTransactions: Transaction[] = referralsData.map(referral => ({
            course_title: referral.courses.title,
            type: 'Referral',
            date: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            amount: referral.courses.referral_reward * referral.successful_referrals,
            status: 'Paid'
          }));
          
          setTransactions(referralTransactions);
        }
        
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        toast({
          title: "Error",
          description: "Failed to load wallet data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWalletData();
  }, [user, toast]);

  const handleWithdraw = () => {
    toast({
      title: "Withdrawal Request Submitted",
      description: "Your withdrawal request has been received and will be processed soon.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Wallet</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-medium text-gray-700 mb-1">Total Balance</h2>
              <div className="text-3xl font-bold">₹ {balance}</div>
            </div>
            {balance >= 100 && (
              <Button 
                className="bg-[#4F46E5] hover:bg-blue-700"
                onClick={handleWithdraw}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 12L12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Withdraw
              </Button>
            )}
          </div>
          
          {balance < 100 && balance > 0 && (
            <p className="text-sm text-gray-500 mt-2">Minimum withdrawal amount is ₹100</p>
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Transaction History</h2>
          <p className="text-sm text-gray-500 mb-4">Your referral earnings and withdrawals</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <TransactionItem 
                key={index}
                title={transaction.course_title}
                type={transaction.type}
                date={transaction.date}
                amount={transaction.amount}
                status={transaction.status}
                isPositive={true}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No transactions yet</p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => navigate('/referrals')}
            >
              Go to Referrals
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Wallet;
