
import React from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import TransactionItem from '@/components/wallet/TransactionItem';

const Wallet: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Wallet</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-medium text-gray-700 mb-1">Total Balance</h2>
              <div className="text-3xl font-bold">₹ 0</div>
            </div>
            <Button className="bg-[#4F46E5] hover:bg-blue-700">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 12L12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Withdraw
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Transaction History</h2>
          <p className="text-sm text-gray-500 mb-4">Your referral earnings and withdrawals</p>
        </div>

        <div className="space-y-4">
          <TransactionItem 
            title="AI Tools Mastery"
            type="Referral"
            date="15 May 2023"
            amount={250}
            status="Paid"
            isPositive={true}
          />

          <TransactionItem 
            title="Stock Market Fundamentals"
            type="Referral"
            date="10 May 2023"
            amount={500}
            status="Pending"
            isPositive={true}
          />
        </div>
      </main>
    </div>
  );
};

export default Wallet;
