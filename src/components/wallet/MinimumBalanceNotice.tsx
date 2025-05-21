
import React from 'react';

interface MinimumBalanceNoticeProps {
  balance: number;
  minimumAmount?: number;
}

const MinimumBalanceNotice: React.FC<MinimumBalanceNoticeProps> = ({ 
  balance, 
  minimumAmount = 250
}) => {
  return (
    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mt-4">
      <p className="font-medium">Minimum withdrawal amount is ₹{minimumAmount}</p>
      <p className="text-sm mt-1">Your current balance is ₹{balance}. Earn more to withdraw.</p>
    </div>
  );
};

export default MinimumBalanceNotice;
