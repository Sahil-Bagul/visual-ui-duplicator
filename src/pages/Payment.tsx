
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import PaymentOption from '@/components/payment/PaymentOption';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PaymentProps {}

const Payment: React.FC<PaymentProps> = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const courseId = location.state?.courseId;
  const courseTitle = location.state?.courseTitle;
  const coursePrice = location.state?.coursePrice || 0;
  const referralCode = location.state?.referralCode || null;
  
  useEffect(() => {
    // Redirect if no course is selected
    if (!courseId) {
      navigate('/dashboard');
    }
  }, [courseId, navigate]);

  const handlePayment = async () => {
    if (!user || !courseId) return;
    
    setIsProcessing(true);
    try {
      // For now, simulate a successful payment since Razorpay isn't fully integrated yet
      
      // Record the purchase in the database
      const purchaseData = {
        user_id: user.id,
        course_id: courseId,
        has_used_referral_code: !!referralCode,
        used_referral_code: referralCode,
        purchased_at: new Date().toISOString()
      };
      
      const { error } = await supabase.from('purchases').insert(purchaseData);
      
      if (error) throw error;
      
      // Note: the database trigger handle_referral_reward will handle:
      // 1. Crediting the referrer's wallet if a valid referral code was used
      // 2. Creating a new referral code for this user for this course
      
      // Show success toast
      toast({
        title: 'Payment Successful!',
        description: `You've successfully purchased ${courseTitle}.`,
      });
      
      // Redirect to success page
      navigate('/payment-success', { 
        state: { 
          courseId,
          courseTitle,
          coursePrice 
        } 
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was a problem with your payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 order-2 md:order-1">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Payment Method</h2>
                <div className="space-y-3">
                  <PaymentOption 
                    id="upi"
                    title="UPI / QR"
                    subtitle="Pay via UPI Apps like GPay, PhonePe, Paytm"
                    selected={selectedPayment === 'upi'}
                    onChange={() => setSelectedPayment('upi')}
                  />
                  
                  <PaymentOption 
                    id="card"
                    title="Credit / Debit Card"
                    subtitle="All major cards accepted"
                    selected={selectedPayment === 'card'}
                    onChange={() => setSelectedPayment('card')}
                  />
                  
                  <PaymentOption 
                    id="netbanking"
                    title="Net Banking"
                    subtitle="All Indian banks supported"
                    selected={selectedPayment === 'netbanking'}
                    onChange={() => setSelectedPayment('netbanking')}
                  />
                </div>
              </div>
              
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-[#00C853] hover:bg-[#00B248] text-white mt-4 py-6 text-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${coursePrice}`
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">Safe & Secure Payment</p>
            </div>
            
            <div className="flex-1 order-1 md:order-2">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">{courseTitle}</span>
                  <span className="font-medium">₹{coursePrice}</span>
                </div>
                
                <div className="flex justify-between items-center mb-3 text-sm">
                  <span className="text-gray-500">GST (Included)</span>
                  <span className="text-gray-500">₹{Math.round(coursePrice * 0.18)}</span>
                </div>
                
                {referralCode && (
                  <div className="bg-blue-50 p-2 rounded text-sm mb-3">
                    <p className="text-blue-700">Referral code applied: {referralCode}</p>
                  </div>
                )}
                
                <div className="border-t border-gray-200 my-3 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">₹{coursePrice}</span>
                  </div>
                </div>
                
                <div className="mt-4 bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    After successful payment, you'll get immediate access to the course PDF and your own referral code.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
