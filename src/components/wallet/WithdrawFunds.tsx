
import React from 'react';
import { useWithdrawalProcess } from '@/hooks/useWithdrawalProcess';
import MinimumBalanceNotice from './MinimumBalanceNotice';
import WithdrawButton from './WithdrawButton';
import PayoutMethodDialog from './PayoutMethodDialog';

interface WithdrawFundsProps {
  balance: number;
  onWithdrawSuccess: () => void;
}

const WithdrawFunds: React.FC<WithdrawFundsProps> = ({ balance, onWithdrawSuccess }) => {
  const { 
    isProcessing, 
    openDialog, 
    setOpenDialog, 
    handleWithdraw 
  } = useWithdrawalProcess({ onWithdrawSuccess });
  
  // Check for minimum balance requirement
  if (balance < 250) {
    return <MinimumBalanceNotice balance={balance} />;
  }

  return (
    <>
      <WithdrawButton 
        balance={balance} 
        isProcessing={isProcessing} 
        onClick={handleWithdraw} 
      />
      
      <PayoutMethodDialog 
        open={openDialog} 
        onOpenChange={setOpenDialog} 
      />
    </>
  );
};

export default WithdrawFunds;
