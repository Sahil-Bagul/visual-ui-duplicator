
import React from 'react';
import { Button } from '@/components/ui/button';

interface CourseCardProps {
  title: string;
  description: string;
  price: number;
  type: string;
  onClick: () => void;
  isPurchased?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  title, 
  description, 
  price, 
  type, 
  onClick,
  isPurchased = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="inline-flex items-center text-blue-600">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
              <path d="M10 4.5V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 14C2.73478 14 2.48043 13.8946 2.29289 13.7071C2.10536 13.5196 2 13.2652 2 13V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H7C7.79565 2 8.55871 2.31607 9.12132 2.87868C9.68393 3.44129 10 4.20435 10 5C10 4.20435 10.3161 3.44129 10.8787 2.87868C11.4413 2.31607 12.2044 2 13 2H17C17.2652 2 17.5196 2.10536 17.7071 2.29289C17.8946 2.48043 18 2.73478 18 3V13C18 13.2652 17.8946 13.5196 17.7071 13.7071C17.5196 13.8946 17.2652 14 17 14H13C12.2044 14 11.4413 13.6839 10.8787 13.1213C10.3161 12.5587 10 11.7956 10 11C10 11.7956 9.68393 12.5587 9.12132 13.1213C8.55871 13.6839 7.79565 14 7 14H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs">{type}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description}
        </p>
      </div>
      <div className="mt-auto">
        <div className="flex items-center justify-between">
          <span className="font-semibold">₹ {price}</span>
          <Button 
            onClick={onClick} 
            className={isPurchased ? "bg-blue-500 hover:bg-blue-600" : "bg-[#00C853] hover:bg-green-600"}
          >
            {isPurchased ? 'View Course' : 'Buy Now'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
