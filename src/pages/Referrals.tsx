
import React from 'react';
import Header from '@/components/layout/Header';
import ReferralCard from '@/components/referrals/ReferralCard';
import { Lock } from 'lucide-react';

const Referrals: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Referral Dashboard</h1>

        <div className="bg-blue-600 rounded-lg shadow-md text-white p-8 mb-8">
          <div className="flex justify-between items-center max-sm:flex-col max-sm:items-start max-sm:gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Your Referral Earnings</h2>
              <p className="text-blue-100">Share courses and earn rewards</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.1)] p-4 rounded-lg">
              <div className="text-sm mb-1">Total Earned</div>
              <div className="text-2xl font-bold">₹ 0</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ReferralCard 
            title="AI Tools Mastery"
            isLocked={true}
            commissionAmount={250}
          />
          
          <ReferralCard 
            title="Stock Market Fundamentals"
            isLocked={true}
            commissionAmount={500}
          />
        </div>
      </main>
    </div>
  );
};

export default Referrals;
