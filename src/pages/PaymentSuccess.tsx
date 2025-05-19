
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface PaymentSuccessProps {}

const PaymentSuccess: React.FC<PaymentSuccessProps> = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const courseId = location.state?.courseId;
  const courseTitle = location.state?.courseTitle || 'Course';
  const coursePrice = location.state?.coursePrice || 0;
  const referralReward = Math.round(coursePrice * 0.5); // 50% referral reward
  
  useEffect(() => {
    // Redirect if no course is selected
    if (!courseId || !user) {
      navigate('/dashboard');
      return;
    }
    
    // Fetch the newly generated referral code
    const fetchReferralCode = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('referrals')
          .select('referral_code')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setReferralCode(data.referral_code);
        }
      } catch (error) {
        console.error('Error fetching referral code:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReferralCode();
  }, [courseId, user, navigate]);
  
  const handleShareWhatsApp = () => {
    if (!referralCode) return;
    
    const message = `Hey! Check out this awesome course on Learn & Earn: ${courseTitle}. Use my referral code ${referralCode} to purchase it! https://learnandearn.in/course/${courseId}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for purchasing {courseTitle}. You now have full access to the course.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={() => navigate('/my-courses')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View My Courses
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
          
          {!isLoading && referralCode && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 mt-6 max-w-lg mx-auto">
              <h2 className="font-semibold text-lg text-yellow-800 mb-2">Refer & Earn ₹{referralReward}!</h2>
              <p className="text-yellow-700 mb-3">Share your unique referral code with friends and earn ₹{referralReward} for each successful purchase they make.</p>
              
              <div className="bg-white border border-gray-200 rounded p-3 flex items-center justify-between mb-4">
                <span className="font-mono font-bold text-lg">{referralCode}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                  }}
                >
                  Copy
                </Button>
              </div>
              
              <Button 
                className="w-full bg-[#25D366] hover:bg-[#20BD5C] text-white mb-2"
                onClick={handleShareWhatsApp}
              >
                Share via WhatsApp
              </Button>
              
              <p className="text-xs text-yellow-600 mt-2">
                You can manage your referrals in the "Referrals" section.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
