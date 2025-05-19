
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import ReferralCard from '@/components/referrals/ReferralCard';
import { Button } from '@/components/ui/button';

const Referrals: React.FC = () => {
  // Mock data for user's purchased courses - in a real app, this would come from backend
  const [purchasedCourses, setPurchasedCourses] = useState<string[]>([
    // "AI Tools Mastery" // Uncomment to simulate owning this course
    // "Stock Market Fundamentals" // Uncomment to simulate owning this course
  ]);

  const hasAICourse = purchasedCourses.includes("AI Tools Mastery");
  const hasStockCourse = purchasedCourses.includes("Stock Market Fundamentals");
  
  // Mock total earnings - this would be calculated from actual referrals in a real app
  const totalEarnings = purchasedCourses.length > 0 
    ? (hasAICourse ? 250 : 0) + (hasStockCourse ? 500 : 0)
    : 0;

  // For demo purposes - toggle course purchase status
  const togglePurchaseStatus = (courseName: string) => {
    if (purchasedCourses.includes(courseName)) {
      setPurchasedCourses(purchasedCourses.filter(course => course !== courseName));
    } else {
      setPurchasedCourses([...purchasedCourses, courseName]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Referral Dashboard</h1>

        <div className="bg-[#2962FF] rounded-lg shadow-md text-white p-8 mb-8">
          <div className="flex justify-between items-center max-sm:flex-col max-sm:items-start max-sm:gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Your Referral Earnings</h2>
              <p className="text-blue-100">Share courses and earn rewards</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.1)] p-4 rounded-lg">
              <div className="text-sm mb-1">Total Earned</div>
              <div className="text-2xl font-bold">₹ {totalEarnings}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ReferralCard 
            title="AI Tools Mastery"
            isLocked={!hasAICourse}
            commissionAmount={250}
            referralCode={hasAICourse ? "RAH-AI-953" : undefined}
          />
          
          <ReferralCard 
            title="Stock Market Fundamentals"
            isLocked={!hasStockCourse}
            commissionAmount={500}
            referralCode={hasStockCourse ? "RAH-SM-753" : undefined}
          />
          
          {/* This button is just for demo purposes to simulate purchasing courses */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-dashed border-gray-300">
            <p className="text-sm text-gray-500 mb-2">Demo Controls (Remove in Production)</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => togglePurchaseStatus("AI Tools Mastery")}
                className="text-xs"
              >
                {hasAICourse ? "Simulate Unpurchase AI Course" : "Simulate Purchase AI Course"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => togglePurchaseStatus("Stock Market Fundamentals")}
                className="text-xs"
              >
                {hasStockCourse ? "Simulate Unpurchase Stock Course" : "Simulate Purchase Stock Course"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Referrals;
