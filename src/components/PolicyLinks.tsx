
import React from 'react';
import { Link } from 'react-router-dom';

const PolicyLinks: React.FC = () => {
  return (
    <div className="text-xs text-gray-500 mt-4">
      <div className="space-x-2">
        <Link to="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>
        <span>•</span>
        <Link to="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link>
        <span>•</span>
        <Link to="/refund-policy" className="text-blue-600 hover:underline">Refund Policy</Link>
      </div>
      <div className="mt-1 space-x-2">
        <Link to="/delivery-policy" className="text-blue-600 hover:underline">Delivery Policy</Link>
        <span>•</span>
        <Link to="/contact" className="text-blue-600 hover:underline">Contact Us</Link>
      </div>
    </div>
  );
};

export default PolicyLinks;
