
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lock, Copy, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReferralCardProps {
  title: string;
  isLocked: boolean;
  commissionAmount: number;
  referralCode?: string;
}

const ReferralCard: React.FC<ReferralCardProps> = ({ 
  title,
  isLocked,
  commissionAmount,
  referralCode = "RAH-AI-953"
}) => {
  const { toast } = useToast();
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: message,
    });
  };

  const shareViaWhatsApp = () => {
    const referralLink = `https://learnandearn.in/ref?code=${referralCode}`;
    const message = `Hey! Check out this amazing course: ${title}. Use my referral code ${referralCode} and get started! ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaTelegram = () => {
    const referralLink = `https://learnandearn.in/ref?code=${referralCode}`;
    const message = `Hey! Check out this amazing course: ${title}. Use my referral code ${referralCode} and get started! ${referralLink}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
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
                <p className="text-sm text-gray-700">Your referral code: <span className="font-medium">{referralCode}</span></p>
              )}
            </div>
            <p className="text-sm text-green-600 mt-1">Earn ₹ {commissionAmount} per successful referral</p>
          </div>
        </div>
        <div>
          {isLocked ? (
            <Button 
              asChild
              className="bg-[#00C853] hover:bg-green-700 text-white"
            >
              <Link to={`/course/${title.toLowerCase().replace(/\s+/g, '-')}`}>Buy Now</Link>
            </Button>
          ) : (
            <Button 
              onClick={handleShare}
              className="bg-[#2962FF] hover:bg-blue-700"
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          )}
        </div>
      </div>

      {!isLocked && showShareOptions && (
        <div className="mt-4 bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-3">Share your referral link & earn ₹{commissionAmount}</p>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between p-3 bg-white rounded border border-blue-100">
              <div className="text-sm font-medium">{referralCode}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(referralCode, "Referral code copied!")}
                className="text-blue-600"
              >
                <Copy className="h-4 w-4 mr-1" /> Copy Code
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded border border-blue-100">
              <div className="text-sm font-medium truncate max-w-[200px]">
                learnandearn.in/ref?code={referralCode}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(`https://learnandearn.in/ref?code=${referralCode}`, "Referral link copied!")}
                className="text-blue-600"
              >
                <Copy className="h-4 w-4 mr-1" /> Copy Link
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button 
                onClick={shareViaWhatsApp}
                variant="outline"
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </Button>
              <Button 
                onClick={shareViaTelegram}
                variant="outline"
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
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
