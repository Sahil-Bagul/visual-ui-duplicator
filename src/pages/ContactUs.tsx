
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';

const ContactUs: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto px-6 py-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Contact Us</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              If you have any questions or need support, please email us at:
            </p>
            <p className="font-medium">
              📩 <a href="mailto:learnandearn776@gmail.com" className="text-[#00C853] hover:underline">learnandearn776@gmail.com</a>
            </p>
          </div>
          <div className="mt-6 space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/privacy-policy')}
              size="sm"
            >
              Privacy Policy
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/terms')}
              size="sm"
            >
              Terms & Conditions
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/refund-policy')}
              size="sm"
            >
              Refund Policy
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/delivery-policy')}
              size="sm"
            >
              Delivery Policy
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;
