
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import PolicyLinks from '@/components/PolicyLinks';

const ContactUs: React.FC = () => {
  const navigate = useNavigate();
  
  // Add metadata for web scrapers
  useEffect(() => {
    document.title = "Contact Us - Learn and Earn";
    
    // Add meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Contact Learn and Earn - Get in touch with our support team for assistance');
    
    // Add canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', window.location.origin + '/contact');
  }, []);
  
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
          <div className="text-sm text-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Information</h2>
            <p className="mb-2">
              Last Updated: May 19, 2025
            </p>
            <p>
              If you have any questions or need support, please email us at:
            </p>
            <p className="font-medium text-base">
              📩 <a href="mailto:learnandearn776@gmail.com" className="text-[#00C853] hover:underline">learnandearn776@gmail.com</a>
            </p>
            
            <h3 className="text-lg font-semibold mt-4">Customer Support Hours</h3>
            <p>
              Monday to Friday: 9:00 AM to 6:00 PM (IST)
            </p>
            <p>
              We aim to respond to all inquiries within 24-48 business hours.
            </p>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="text-lg font-semibold">Business Information</h3>
              <p className="mt-2">Learn and Earn</p>
              <p>India</p>
              <p>Email: learnandearn776@gmail.com</p>
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

export default ContactUs;
