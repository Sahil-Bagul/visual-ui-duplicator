
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import PolicyLinks from '@/components/PolicyLinks';

const DeliveryPolicy: React.FC = () => {
  const navigate = useNavigate();
  
  // Add metadata for web scrapers
  useEffect(() => {
    document.title = "Delivery Policy - Learn and Earn";
    
    // Add meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Learn and Earn Delivery Policy - How our digital products are delivered to customers');
    
    // Add canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', window.location.origin + '/delivery-policy');
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto px-6 py-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Shipping and Delivery Policy</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Shipping and Delivery Policy for Learn and Earn</h2>
            <p className="mb-2">
              Last Updated: May 19, 2025
            </p>
            <p>
              All products sold on Learn and Earn are <strong>digital PDF files</strong>.
            </p>
            <p>
              Once payment is successful, instant access is granted via email or through the user dashboard.
            </p>
            <p>
              No physical shipping is involved as all products are digital downloads.
            </p>
            
            <h3 className="text-lg font-semibold mt-4">Delivery Method</h3>
            <p>
              1. Digital courses are delivered instantly through our online platform.
            </p>
            <p>
              2. You will receive access to download your purchased courses directly from your user dashboard.
            </p>
            <p>
              3. An email confirmation with access instructions will also be sent to your registered email address.
            </p>
            
            <div className="mt-6 text-base">
              <p>For any questions about our delivery process, please contact us at: <a href="mailto:learnandearn776@gmail.com" className="text-[#00C853] hover:underline">learnandearn776@gmail.com</a></p>
            </div>
          </div>
          
          <div className="mt-6">
            <PolicyLinks />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeliveryPolicy;
