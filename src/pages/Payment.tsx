
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PaymentOption from '@/components/payment/PaymentOption';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Payment: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralApplied, setReferralApplied] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleApplyCode = () => {
    if (!referralCode) {
      toast({
        title: "Error",
        description: "Please enter a referral code",
        variant: "destructive"
      });
      return;
    }

    // In a real app, validate the code with the backend
    setReferralApplied(true);
    toast({
      title: "Success",
      description: "Referral code applied successfully!",
    });
  };

  const handlePaymentSubmit = () => {
    if (!selectedPayment) return;

    // In a real app, process payment with the selected method
    // For demo purposes, different UPI deep links based on selected payment
    if (selectedPayment === 'phonepe') {
      // PhonePe UPI deep link with fixed amount
      window.location.href = "upi://pay?pa=learnandearn@ybl&pn=LearnAndEarn&am=500.00&cu=INR&tn=Payment%20for%20AI%20Tools%20Course";
    } else if (selectedPayment === 'googlepay') {
      // Google Pay UPI deep link
      window.location.href = "tez://upi/pay?pa=learnandearn@okicici&pn=LearnAndEarn&am=500.00&cu=INR&tn=Payment%20for%20AI%20Tools%20Course";
    } else if (selectedPayment === 'paytm') {
      // Paytm UPI deep link
      window.location.href = "paytmmp://pay?pa=learnandearn@paytm&pn=LearnAndEarn&am=500.00&cu=INR&tn=Payment%20for%20AI%20Tools%20Course";
    } else if (selectedPayment === 'upi') {
      // Generic UPI deep link for other apps
      window.location.href = "upi://pay?pa=learnandearn@upi&pn=LearnAndEarn&am=500.00&cu=INR&tn=Payment%20for%20AI%20Tools%20Course";
    }

    // For demo purposes, directly navigate to success page after a small delay
    // In a real app, this would happen after payment confirmation
    setTimeout(() => {
      navigate('/payment-success');
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Choose a Payment Method</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-base font-medium text-gray-700 mb-3">Order Summary</h2>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span>AI Tools Mastery</span>
              <span className="font-medium">₹ 500</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="font-medium">Total</span>
              <span className="font-bold">₹ 500</span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium mb-2">Have a referral code?</h3>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code"
                disabled={referralApplied}
                className="max-w-xs"
              />
              <Button 
                onClick={handleApplyCode}
                variant="outline"
                disabled={referralApplied}
              >
                {referralApplied ? "Applied" : "Apply"}
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
              You'll earn ₹ 250 per referral after purchase
            </div>
            <Button 
              onClick={handlePaymentSubmit}
              disabled={!selectedPayment}
              className="w-full bg-[#00C853] hover:bg-green-700 text-white disabled:bg-gray-300"
            >
              Complete Payment
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
