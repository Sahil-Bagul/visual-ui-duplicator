
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ReferralCardProps {
  title: string;
  isLocked: boolean;
  commissionAmount: number;
  referralCode?: string;
  successfulReferrals?: number;
  totalEarned?: number;
  onGetAccess?: () => void;
}

const ReferralCard: React.FC<ReferralCardProps> = ({
  title,
  isLocked,
  commissionAmount,
  referralCode,
  successfulReferrals = 0,
  totalEarned = 0,
  onGetAccess
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const handleCopyCode = () => {
    if (!referralCode) return;
    
    navigator.clipboard.writeText(referralCode);
    setIsCopied(true);
    
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
    
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleShareWhatsApp = () => {
    if (!referralCode) return;
    
    const message = `Check out this course on Learn & Earn! Use my referral code ${referralCode} for ${title}. learnandearn.in`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleShareTelegram = () => {
    if (!referralCode) return;
    
    const message = `Check out this course on Learn & Earn! Use my referral code ${referralCode} for ${title}. learnandearn.in`;
    const telegramUrl = `https://t.me/share/url?url=learnandearn.in&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className={`rounded-lg border ${isLocked ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-100'} p-6`}>
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">Commission: ₹{commissionAmount} per referral</p>
        </div>
        {!isLocked && (
          <div className="bg-blue-50 px-3 py-1 rounded-full text-blue-600 text-sm font-semibold self-start">
            Active
          </div>
        )}
      </div>

      {isLocked ? (
        <div>
          <div className="flex items-center mb-4 text-gray-500">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Referral locked
          </div>
          <p className="text-sm text-gray-600 mb-4">Purchase this course to unlock referral earnings</p>
          <Button 
            className="w-full bg-[#00C853] hover:bg-green-700"
            onClick={onGetAccess}
          >
            Get Access
          </Button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-500">Successful Referrals</div>
              <div className="font-bold text-xl">{successfulReferrals}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-500">Total Earned</div>
              <div className="font-bold text-xl">₹ {totalEarned}</div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">Your Referral Code</label>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-50 border border-gray-200 py-2 px-3 rounded-l-md text-center font-medium">
                {referralCode}
              </div>
              <button 
                className="bg-blue-50 border border-blue-100 border-l-0 py-2 px-3 rounded-r-md hover:bg-blue-100"
                onClick={handleCopyCode}
              >
                {isCopied ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6667 7.5H8.33333C7.8731 7.5 7.5 7.8731 7.5 8.33333V16.6667C7.5 17.1269 7.8731 17.5 8.33333 17.5H16.6667C17.1269 17.5 17.5 17.1269 17.5 16.6667V8.33333C17.5 7.8731 17.1269 7.5 16.6667 7.5Z" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4.16663 12.5H3.33329C3.11227 12.5 2.90051 12.4122 2.74423 12.2559C2.58795 12.0996 2.49996 11.8879 2.49996 11.6667V3.33333C2.49996 3.11232 2.58795 2.90056 2.74423 2.74428C2.90051 2.588 3.11227 2.5 3.33329 2.5H11.6666C11.8877 2.5 12.0994 2.588 12.2557 2.74428C12.412 2.90056 12.5 3.11232 12.5 3.33333V4.16667" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Share with Friends</label>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={handleShareWhatsApp}
              >
                WhatsApp
              </Button>
              <Button
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                onClick={handleShareTelegram}
              >
                Telegram
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralCard;
