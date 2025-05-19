
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import PaymentOption from '@/components/payment/PaymentOption';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface PaymentState {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  referralCode: string | null;
}

const Payment: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralApplied, setReferralApplied] = useState<boolean>(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const paymentState = location.state as PaymentState;
  
  useEffect(() => {
    // Check if we have course information from navigation state
    if (!paymentState?.courseId) {
      toast({
        title: "Error",
        description: "Course information is missing. Please try again.",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }
    
    // Set referral code if it was passed from course detail
    if (paymentState.referralCode) {
      setReferralCode(paymentState.referralCode);
      verifyReferralCode(paymentState.referralCode);
    }
  }, [paymentState, navigate, toast]);

  const verifyReferralCode = async (code: string) => {
    if (!code) return;
    
    setIsVerifyingCode(true);
    
    try {
      // Check if referral code exists for this course
      const { data, error } = await supabase
        .from('referrals')
        .select('id, course_id')
        .eq('referral_code', code)
        .eq('course_id', paymentState?.courseId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setReferralApplied(true);
        toast({
          title: "Success",
          description: "Referral code applied successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid referral code for this course.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error verifying referral code:", error);
      toast({
        title: "Error",
        description: "Failed to verify referral code.",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleApplyCode = () => {
    if (!referralCode) {
      toast({
        title: "Error",
        description: "Please enter a referral code",
        variant: "destructive"
      });
      return;
    }

    verifyReferralCode(referralCode);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPayment || !user || !paymentState?.courseId) return;

    setIsProcessingPayment(true);
    
    try {
      // Record the purchase
      const { error } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          course_id: paymentState.courseId,
          has_used_referral_code: referralApplied,
          used_referral_code: referralApplied ? referralCode : null
        });
        
      if (error) throw error;
      
      // In a real app, process payment with the selected method
      // For demo purposes, different UPI deep links based on selected payment
      if (selectedPayment === 'phonepe') {
        // PhonePe UPI deep link with fixed amount
        window.location.href = `upi://pay?pa=learnandearn@ybl&pn=LearnAndEarn&am=${paymentState.coursePrice}.00&cu=INR&tn=Payment%20for%20${encodeURIComponent(paymentState.courseTitle)}`;
      } else if (selectedPayment === 'googlepay') {
        // Google Pay UPI deep link
        window.location.href = `tez://upi/pay?pa=learnandearn@okicici&pn=LearnAndEarn&am=${paymentState.coursePrice}.00&cu=INR&tn=Payment%20for%20${encodeURIComponent(paymentState.courseTitle)}`;
      } else if (selectedPayment === 'paytm') {
        // Paytm UPI deep link
        window.location.href = `paytmmp://pay?pa=learnandearn@paytm&pn=LearnAndEarn&am=${paymentState.coursePrice}.00&cu=INR&tn=Payment%20for%20${encodeURIComponent(paymentState.courseTitle)}`;
      } else if (selectedPayment === 'upi') {
        // Generic UPI deep link for other apps
        window.location.href = `upi://pay?pa=learnandearn@upi&pn=LearnAndEarn&am=${paymentState.coursePrice}.00&cu=INR&tn=Payment%20for%20${encodeURIComponent(paymentState.courseTitle)}`;
      }

      // For demo purposes, directly navigate to success page after a small delay
      // In a real app, this would happen after payment confirmation
      setTimeout(() => {
        navigate('/payment-success', { 
          state: { 
            courseId: paymentState.courseId,
            courseTitle: paymentState.courseTitle,
          }
        });
      }, 1000);
      
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      });
      setIsProcessingPayment(false);
    }
  };

  if (!paymentState) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
          <div className="text-center py-8">
            <p className="text-gray-600">Missing course information. Please go back to course selection.</p>
            <Button className="mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Choose a Payment Method</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-base font-medium text-gray-700 mb-3">Order Summary</h2>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span>{paymentState.courseTitle}</span>
              <span className="font-medium">₹ {paymentState.coursePrice}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="font-medium">Total</span>
              <span className="font-bold">₹ {paymentState.coursePrice}</span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium mb-2">Have a referral code?</h3>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code"
                disabled={referralApplied || isVerifyingCode}
                className="max-w-xs"
              />
              <Button 
                onClick={handleApplyCode}
                variant="outline"
                disabled={referralApplied || isVerifyingCode}
              >
                {isVerifyingCode ? "Verifying..." : referralApplied ? "Applied" : "Apply"}
              </Button>
            </div>
            {referralApplied && (
              <p className="mt-2 text-sm text-green-600">Referral code applied successfully!</p>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="text-base font-medium text-gray-700 mb-2">Select Payment Method</h3>
            
            <PaymentOption 
              icon={
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500 text-white">
                  <span>P</span>
                </div>
              }
              title="PhonePe"
              description="Pay using PhonePe UPI"
              isSelected={selectedPayment === 'phonepe'}
              onClick={() => setSelectedPayment('phonepe')}
            />

            <PaymentOption 
              icon={
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white">
                  <span>G</span>
                </div>
              }
              title="Google Pay"
              description="Pay using Google Pay UPI"
              isSelected={selectedPayment === 'googlepay'}
              onClick={() => setSelectedPayment('googlepay')}
            />

            <PaymentOption 
              icon={
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white">
                  <span>P</span>
                </div>
              }
              title="Paytm"
              description="Pay using Paytm Wallet or UPI"
              isSelected={selectedPayment === 'paytm'}
              onClick={() => setSelectedPayment('paytm')}
            />

            <PaymentOption 
              icon={
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-600 text-white">
                  <span>UPI</span>
                </div>
              }
              title="Other UPI Apps"
              description="Pay using any UPI app"
              isSelected={selectedPayment === 'upi'}
              onClick={() => setSelectedPayment('upi')}
            />
          </div>

          <div className="border-t border-gray-200 mt-6 pt-6">
            <div className="text-sm text-gray-500 mb-6 text-center">
              You'll earn ₹ {paymentState.coursePrice / 2} per referral after purchase
            </div>
            <Button 
              onClick={handlePaymentSubmit}
              disabled={!selectedPayment || isProcessingPayment}
              className="w-full bg-[#00C853] hover:bg-green-700 text-white disabled:bg-gray-300"
            >
              {isProcessingPayment ? "Processing..." : "Complete Payment"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
