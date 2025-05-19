
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface ReferralCardProps {
  title: string;
  isLocked: boolean;
  commissionAmount: number;
}

const ReferralCard: React.FC<ReferralCardProps> = ({ 
  title,
  isLocked,
  commissionAmount
}) => {
  return (
    <div className="flex justify-between items-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-start">
        <div className="mr-4">
          {isLocked && (
            <div className="w-8 h-8 flex items-center justify-center text-gray-400">
              <Lock size={20} />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-medium mb-1">{title}</h3>
          <div className="flex items-center">
            {isLocked ? (
              <p className="text-sm text-gray-500">Locked (Purchase to Unlock)</p>
            ) : (
              <p className="text-sm text-gray-700">Your referral code: <span className="font-medium">RAH-AI-953</span></p>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Earn ₹ {commissionAmount} per successful referral</p>
        </div>
      </div>
      <div>
        <Button 
          disabled={isLocked}
          className={`${isLocked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#4F46E5] hover:bg-blue-700'}`}
        >
          {isLocked ? 'Locked' : 'Share'}
        </Button>
      </div>
    </div>
  );
};

export default ReferralCard;
