
import React from 'react';

interface PaymentOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const PaymentOption: React.FC<PaymentOptionProps> = ({ 
  icon, 
  title, 
  description, 
  isSelected, 
  onClick 
}) => {
  return (
    <div 
      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-[#00C853] bg-green-50' : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="mr-4">
        {icon}
      </div>
      <div className="flex-grow">
        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default PaymentOption;
