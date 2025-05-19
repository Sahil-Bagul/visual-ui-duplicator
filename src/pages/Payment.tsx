
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PaymentOption from '@/components/payment/PaymentOption';

const Payment: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePaymentSubmit = () => {
    navigate('/payment-success');
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

          <div className="space-y-3">
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
              className="w-full bg-[#4F46E5] hover:bg-blue-700 disabled:bg-gray-300"
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
