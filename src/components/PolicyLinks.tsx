
import React from 'react';
import { Link } from 'react-router-dom';

const PolicyLinks: React.FC = () => {
  return (
    <div className="text-xs text-gray-500 mt-4">
      <div className="space-x-2">
        <Link to="/privacy-policy" className="text-[#00C853] hover:underline font-medium">Privacy Policy</Link>
        <span>•</span>
        <Link to="/terms" className="text-[#00C853] hover:underline font-medium">Terms & Conditions</Link>
        <span>•</span>
        <Link to="/refund-policy" className="text-[#00C853] hover:underline font-medium">Refund Policy</Link>
      </div>
      <div className="mt-1 space-x-2">
        <Link to="/delivery-policy" className="text-[#00C853] hover:underline font-medium">Delivery Policy</Link>
        <span>•</span>
        <Link to="/contact" className="text-[#00C853] hover:underline font-medium">Contact Us</Link>
      </div>
    </div>
  );
};

export default PolicyLinks;
