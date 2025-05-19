
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import PolicyLinks from '@/components/PolicyLinks';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  
  // Add metadata for web scrapers
  useEffect(() => {
    document.title = "Privacy Policy - Learn and Earn";
    
    // Add meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Learn and Earn Privacy Policy - How we collect, use, and protect your data');
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto px-6 py-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Privacy Policy for Learn and Earn</h2>
            <p className="mb-2">
              Last Updated: May 19, 2025
            </p>
            <p>
              We collect limited personal information from users (name, email, and phone number) for account access and communication purposes only.
            </p>
            <p>
              All data is securely stored using Supabase and is never sold or shared with third parties under any circumstances.
            </p>
            <p>
              By using our app, you agree to the collection and use of information in accordance with this privacy policy.
            </p>
            
            <h3 className="text-lg font-semibold mt-4">Information We Collect</h3>
            <p>
              1. Personal Information: Name, email address, and phone number for account creation and verification.
            </p>
            <p>
              2. Usage Data: Information on how you interact with our platform to improve user experience.
            </p>
            
            <h3 className="text-lg font-semibold mt-4">Data Security</h3>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access or disclosure.
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

export default PrivacyPolicy;
