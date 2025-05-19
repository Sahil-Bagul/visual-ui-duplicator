import React from 'react';

interface CourseCardProps {
  title: string;
  description: string;
  price: number;
  type: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ title, description, price, type }) => {
  return (
    <div className="border border flex-1 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)] bg-white p-6 rounded-lg border-solid max-sm:p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
        <div className="flex items-center gap-1 text-xs text-blue-600">
          <svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1_279)">
              <path
                d="M10.6719 5.83337V17.5"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.17171 15C2.9507 15 2.73874 14.9122 2.58246 14.7559C2.42618 14.5996 2.33838 14.3877 2.33838 14.1667V3.33333C2.33838 3.11232 2.42618 2.90036 2.58246 2.74408C2.73874 2.5878 2.9507 2.5 3.17171 2.5H7.33838C8.22243 2.5 9.07028 2.85119 9.6954 3.47631C10.3205 4.10143 10.6717 4.94928 10.6717 5.83333C10.6717 4.94928 11.0229 4.10143 11.648 3.47631C12.2731 2.85119 13.121 2.5 14.005 2.5H18.1717C18.3927 2.5 18.6047 2.5878 18.761 2.74408C18.9172 2.90036 19.005 3.11232 19.005 3.33333V14.1667C19.005 14.3877 18.9172 14.5996 18.761 14.7559C18.6047 14.9122 18.3927 15 18.1717 15H13.1717C12.5087 15 11.8728 15.2634 11.4039 15.7322C10.9351 16.2011 10.6717 16.837 10.6717 17.5C10.6717 16.837 10.4083 16.2011 9.93948 15.7322C9.47064 15.2634 8.83475 15 8.17171 15H3.17171Z"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_1_279">
                <rect width="20" height="20" fill="white" transform="translate(0.671875)" />
              </clipPath>
            </defs>
          </svg>
          <span>{type}</span>
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="text-[15px] font-bold text-gray-900">₹{price}</div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12.6667 7.33337H3.33333C2.59695 7.33337 2 7.93033 2 8.66671V13.3334C2 14.0698 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0698 14 13.3334V8.66671C14 7.93033 13.403 7.33337 12.6667 7.33337Z"
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.6665 7.33337V4.66671C4.6665 3.78265 5.01769 2.93481 5.64281 2.30968C6.26794 1.68456 7.11578 1.33337 7.99984 1.33337C8.88389 1.33337 9.73174 1.68456 10.3569 2.30968C10.982 2.93481 11.3332 3.78265 11.3332 4.66671V7.33337"
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Unlock referrals after purchase</span>
          </div>
        </div>
        <button className="text-white text-xs cursor-pointer bg-blue-600 px-4 py-[9px] rounded-md border-[none] hover:bg-blue-700 transition-colors">
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
