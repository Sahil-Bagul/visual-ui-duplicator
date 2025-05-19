import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)] bg-white">
      <div className="max-w-[993px] h-16 flex justify-between items-center mx-auto my-0 px-4 py-0">
        <Link to="/" className="text-[17px] font-bold text-blue-600">
          Learn &amp; Earn
        </Link>
        <nav className="flex gap-8 max-sm:hidden">
          <NavItem icon={<HomeIcon />} label="Home" active />
          <NavItem icon={<CoursesIcon />} label="My Courses" />
          <NavItem icon={<ReferralsIcon />} label="Referrals" />
          <NavItem icon={<WalletIcon />} label="Wallet" />
          <NavItem icon={<ProfileIcon />} label="Profile" />
        </nav>
      </div>
    </header>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active }) => {
  return (
    <Link
      to="/"
      className={`flex items-center gap-1 text-xs ${
        active ? 'text-gray-900 border-b-2 border-b-blue-600' : 'text-gray-500 border-b-2 border-b-transparent'
      } px-1 py-[5px] border-solid hover:text-gray-900 transition-colors`}
    >
      <div>{icon}</div>
      <span>{label}</span>
    </Link>
  );
};

// Icons
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10.875 14V8.66667C10.875 8.48986 10.8048 8.32029 10.6797 8.19526C10.5547 8.07024 10.3851 8 10.2083 8H7.54167C7.36486 8 7.19529 8.07024 7.07026 8.19526C6.94524 8.32029 6.875 8.48986 6.875 8.66667V14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.875 6.66673C2.87495 6.47277 2.91722 6.28114 2.99886 6.1052C3.08049 5.92927 3.19953 5.77326 3.34767 5.64806L8.01433 1.64873C8.25499 1.44533 8.5599 1.33374 8.875 1.33374C9.1901 1.33374 9.49501 1.44533 9.73567 1.64873L14.4023 5.64806C14.5505 5.77326 14.6695 5.92927 14.7511 6.1052C14.8328 6.28114 14.875 6.47277 14.875 6.66673V12.6667C14.875 13.0203 14.7345 13.3595 14.4845 13.6095C14.2344 13.8596 13.8953 14.0001 13.5417 14.0001H4.20833C3.85471 14.0001 3.51557 13.8596 3.26552 13.6095C3.01548 13.3595 2.875 13.0203 2.875 12.6667V6.66673Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CoursesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_1_231)">
      <path
        d="M8.875 4.66663V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.87516 12C2.69835 12 2.52878 11.9298 2.40376 11.8047C2.27873 11.6797 2.2085 11.5101 2.2085 11.3333V2.66667C2.2085 2.48986 2.27873 2.32029 2.40376 2.19526C2.52878 2.07024 2.69835 2 2.87516 2H6.2085C6.91574 2 7.59402 2.28095 8.09411 2.78105C8.59421 3.28115 8.87516 3.95942 8.87516 4.66667C8.87516 3.95942 9.15611 3.28115 9.65621 2.78105C10.1563 2.28095 10.8346 2 11.5418 2H14.8752C15.052 2 15.2215 2.07024 15.3466 2.19526C15.4716 2.32029 15.5418 2.48986 15.5418 2.66667V11.3333C15.5418 11.5101 15.4716 11.6797 15.3466 11.8047C15.2215 11.9298 15.052 12 14.8752 12H10.8752C10.3447 12 9.83602 12.2107 9.46095 12.5858C9.08588 12.9609 8.87516 13.4696 8.87516 14C8.87516 13.4696 8.66445 12.9609 8.28938 12.5858C7.9143 12.2107 7.4056 12 6.87516 12H2.87516Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_1_231">
        <rect width="16" height="16" fill="white" transform="translate(0.875)" />
      </clipPath>
    </defs>
  </svg>
);

const ReferralsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10.6668 14V12.6667C10.6668 11.9594 10.3859 11.2811 9.88578 10.781C9.38568 10.281 8.70741 10 8.00016 10H4.00016C3.29292 10 2.61464 10.281 2.11454 10.781C1.61445 11.2811 1.3335 11.9594 1.3335 12.6667V14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.00016 7.33333C7.47292 7.33333 8.66683 6.13943 8.66683 4.66667C8.66683 3.19391 7.47292 2 6.00016 2C4.5274 2 3.3335 3.19391 3.3335 4.66667C3.3335 6.13943 4.5274 7.33333 6.00016 7.33333Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.6665 14V12.6667C14.6661 12.0758 14.4694 11.5019 14.1074 11.0349C13.7454 10.5679 13.2386 10.2344 12.6665 10.0867"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.6665 2.08667C11.2401 2.23354 11.7485 2.56714 12.1116 3.03488C12.4747 3.50262 12.6717 4.07789 12.6717 4.67C12.6717 5.26212 12.4747 5.83739 12.1116 6.30513C11.7485 6.77287 11.2401 7.10647 10.6665 7.25334"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WalletIcon = () => (
  <svg width="16" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_1_243)">
      <path
        d="M13.1042 4.66667V2.66667C13.1042 2.48986 13.0339 2.32029 12.9089 2.19526C12.7839 2.07024 12.6143 2 12.4375 2H3.77083C3.41721 2 3.07807 2.14048 2.82802 2.39052C2.57798 2.64057 2.4375 2.97971 2.4375 3.33333C2.4375 3.68696 2.57798 4.02609 2.82802 4.27614C3.07807 4.52619 3.41721 4.66667 3.77083 4.66667H13.7708C13.9476 4.66667 14.1172 4.7369 14.2422 4.86193C14.3673 4.98695 14.4375 5.15652 14.4375 5.33333V8M14.4375 8H12.4375C12.0839 8 11.7447 8.14048 11.4947 8.39052C11.2446 8.64057 11.1042 8.97971 11.1042 9.33333C11.1042 9.68696 11.2446 10.0261 11.4947 10.2761C11.7447 10.5262 12.0839 10.6667 12.4375 10.6667H14.4375C14.6143 10.6667 14.7839 10.5964 14.9089 10.4714C15.0339 10.3464 15.1042 10.1768 15.1042 10V8.66667C15.1042 8.48986 15.0339 8.32029 14.9089 8.19526C14.7839 8.07024 14.6143 8 14.4375 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.4375 3.33337V12.6667C2.4375 13.0203 2.57798 13.3595 2.82802 13.6095C3.07807 13.8596 3.41721 14 3.77083 14H13.7708C13.9476 14 14.1172 13.9298 14.2422 13.8048C14.3673 13.6798 14.4375 13.5102 14.4375 13.3334V10.6667"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_1_243">
        <rect width="16" height="16" fill="white" transform="translate(0.4375)" />
      </clipPath>
    </defs>
  </svg>
);

const ProfileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.0418 14V12.6667C13.0418 11.9594 12.7609 11.2811 12.2608 10.781C11.7607 10.281 11.0824 10 10.3752 10H6.37516C5.66792 10 4.98964 10.281 4.48954 10.781C3.98945 11.2811 3.7085 11.9594 3.7085 12.6667V14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.37516 7.33333C9.84792 7.33333 11.0418 6.13943 11.0418 4.66667C11.0418 3.19391 9.84792 2 8.37516 2C6.9024 2 5.7085 3.19391 5.7085 4.66667C5.7085 6.13943 6.9024 7.33333 8.37516 7.33333Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Header;
