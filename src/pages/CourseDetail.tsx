
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CourseDetailProps {
  title?: string;
  price?: number;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ 
  title = "AI Tools Mastery",
  price = 500
}) => {
  const [referralCode, setReferralCode] = useState('');
  const navigate = useNavigate();

  const handleProceedToPayment = () => {
    navigate('/payment');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <div className="inline-flex items-center text-blue-600">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                <path d="M10 4.5V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14C2.73478 14 2.48043 13.8946 2.29289 13.7071C2.10536 13.5196 2 13.2652 2 13V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H7C7.79565 2 8.55871 2.31607 9.12132 2.87868C9.68393 3.44129 10 4.20435 10 5C10 4.20435 10.3161 3.44129 10.8787 2.87868C11.4413 2.31607 12.2044 2 13 2H17C17.2652 2 17.5196 2.10536 17.7071 2.29289C17.8946 2.48043 18 2.73478 18 3V13C18 13.2652 17.8946 13.5196 17.7071 13.7071C17.5196 13.8946 17.2652 14 17 14H13C12.2044 14 11.4413 13.6839 10.8787 13.1213C10.3161 12.5587 10 11.7956 10 11C10 11.7956 9.68393 12.5587 9.12132 13.1213C8.55871 13.6839 7.79565 14 7 14H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm">PDF Course</span>
            </div>
          </div>

          <div className="mb-6 text-gray-600">
            <p className="mb-4">Learn how to leverage AI tools to boost your productivity and creativity. This comprehensive guide covers the most popular AI tools and how to use them effectively.</p>
            <p>This comprehensive PDF guide will help you master the fundamentals and advanced techniques needed to succeed in this field. Perfect for college students looking to enhance their skills.</p>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          <div className="flex flex-col mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold">₹ {price}</span>
              <Button className="bg-[#4F46E5] hover:bg-blue-700" onClick={handleProceedToPayment}>Buy Now</Button>
            </div>
            <div className="text-sm text-gray-500">Earn ₹ 250 per successful referral after purchase</div>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          <div>
            <label htmlFor="referral-code" className="text-sm font-medium text-gray-700 block mb-2">
              Have a referral code?
            </label>
            <div className="flex gap-2">
              <Input
                id="referral-code"
                placeholder="Enter referral code (optional)"
                className="max-w-xs"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;
