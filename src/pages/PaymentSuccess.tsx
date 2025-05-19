
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const referralCode = "RAH-AI-953";
  
  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    // Could add a toast notification here
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="text-green-500 w-10 h-10" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">Thank you for purchasing AI Tools Mastery</p>

          <div className="border-t border-gray-200 my-6"></div>

          <h2 className="text-lg font-semibold mb-4">Download Your Course</h2>
          <Button className="bg-[#4F46E5] hover:bg-blue-700 mb-8">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download PDF
          </Button>

          <div className="bg-green-50 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-2">
              <span className="text-green-700 mr-2">🎉</span>
              <h3 className="text-lg font-semibold text-green-700">Referral Unlocked!</h3>
            </div>
            <p className="text-green-700 mb-4 text-sm">
              You can now earn ₹ 250 for each friend who purchases this course using your referral code.
            </p>
            
            <div className="mb-4">
              <label className="text-sm text-green-700 font-medium block mb-2">Your Unique Referral Code</label>
              <div className="flex items-center">
                <div className="flex-1 bg-white border border-green-200 py-2 px-3 rounded-l-md text-center text-green-800 font-medium">
                  {referralCode}
                </div>
                <button 
                  className="bg-white border border-green-200 border-l-0 py-2 px-3 rounded-r-md"
                  onClick={handleCopyReferralCode}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Share with Friends
            </Button>
          </div>

          <div className="flex justify-center space-x-4">
            <Button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" 
                  onClick={() => navigate('/my-courses')}>
              My Courses
            </Button>
            <Button className="bg-[#4F46E5] hover:bg-blue-700"
                  onClick={() => navigate('/referrals')}>
              Go to Referrals
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
