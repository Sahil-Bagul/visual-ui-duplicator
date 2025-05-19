
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import PolicyLinks from '@/components/PolicyLinks';

const TermsConditions: React.FC = () => {
  const navigate = useNavigate();
  
  // Add metadata for web scrapers
  useEffect(() => {
    document.title = "Terms and Conditions - Learn and Earn";
    
    // Add meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Learn and Earn Terms and Conditions - Rules, guidelines, and legal agreements for using our platform');
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto px-6 py-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Terms and Conditions</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Terms and Conditions for Learn and Earn</h2>
            <p className="mb-2">
              Last Updated: May 19, 2025
            </p>
            <p>
              By purchasing any course through Learn and Earn, you agree to abide by our referral system and usage terms outlined in this document.
            </p>
            <p>
              Users are responsible for keeping their login credentials secure and protecting their account information.
            </p>
            <p>
              Learn and Earn reserves the right to update features, pricing, and policies at any time without prior notice.
            </p>
            
            <h3 className="text-lg font-semibold mt-4">User Accounts</h3>
            <p>
              1. Users must provide accurate and complete information when creating an account.
            </p>
            <p>
              2. You are responsible for maintaining the confidentiality of your account credentials.
            </p>
            <p>
              3. You agree to notify us immediately of any unauthorized access to your account.
            </p>
            
            <h3 className="text-lg font-semibold mt-4">Referral Program</h3>
            <p>
              1. Users earn commission through our referral program as described on our platform.
            </p>
            <p>
              2. Referral rewards are subject to verification and approval.
            </p>
            <p>
              3. Learn and Earn reserves the right to modify or terminate the referral program at any time.
            </p>
          </div>
          
          <div className="mt-6">
            <PolicyLinks />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsConditions;
