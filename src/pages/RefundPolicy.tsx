
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import PolicyLinks from '@/components/PolicyLinks';

const RefundPolicy: React.FC = () => {
  const navigate = useNavigate();
  
  // Add metadata for web scrapers
  useEffect(() => {
    document.title = "Refund Policy - Learn and Earn";
    
    // Add meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Learn and Earn Refund Policy - Our policy on cancellations and refunds for digital products');
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto px-6 py-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cancellation and Refund Policy</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Cancellation and Refund Policy for Learn and Earn</h2>
            <p className="mb-2">
              Last Updated: May 19, 2025
            </p>
            <p>
              We do <strong>not</strong> offer cancellations or refunds after payment is made. All sales are final.
            </p>
            <p>
              Please ensure that you are confident before purchasing any of our digital courses.
            </p>
            
            <h3 className="text-lg font-semibold mt-4">No Refund Policy Details</h3>
            <p>
              1. Once a purchase is completed, you will receive immediate access to your digital product.
            </p>
            <p>
              2. Due to the nature of digital products, which cannot be returned, all purchases are final.
            </p>
            <p>
              3. Before making a purchase, we recommend reviewing all product details carefully.
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

export default RefundPolicy;
