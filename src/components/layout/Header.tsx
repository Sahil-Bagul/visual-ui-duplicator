
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu } from 'lucide-react';

// Import the logo
import logoImage from '@/assets/learnandearn-logo.png';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-[993px] mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo with error handling */}
        <div className="flex items-center">
          <NavLink to="/dashboard" className="flex items-center">
            {/* Logo with fallback */}
            <div className="h-8 w-auto mr-2">
              <img 
                src={logoImage} 
                alt="Learn & Earn" 
                className="h-full w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  // Show text fallback when image fails
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              {/* Text fallback (hidden by default) */}
              <span 
                className="text-lg font-bold text-gray-900 hidden" 
                style={{ display: 'none' }}
              >
                Learn & Earn
              </span>
            </div>
          </NavLink>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              isActive ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"
            }
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/my-courses" 
            className={({ isActive }) => 
              isActive ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"
            }
          >
            My Courses
          </NavLink>
          <NavLink 
            to="/referrals" 
            className={({ isActive }) => 
              isActive ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"
            }
          >
            Referrals
          </NavLink>
          <NavLink 
            to="/wallet" 
            className={({ isActive }) => 
              isActive ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"
            }
          >
            Wallet
          </NavLink>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => 
              isActive ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"
            }
          >
            Profile
          </NavLink>
        </nav>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 right-0 left-0 bg-white z-50 border-b border-gray-200 shadow-md">
            <div className="flex flex-col p-4 space-y-3">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  isActive ? "text-blue-600 font-medium p-2" : "text-gray-600 hover:text-gray-900 p-2"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/my-courses" 
                className={({ isActive }) => 
                  isActive ? "text-blue-600 font-medium p-2" : "text-gray-600 hover:text-gray-900 p-2"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                My Courses
              </NavLink>
              <NavLink 
                to="/referrals" 
                className={({ isActive }) => 
                  isActive ? "text-blue-600 font-medium p-2" : "text-gray-600 hover:text-gray-900 p-2"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Referrals
              </NavLink>
              <NavLink 
                to="/wallet" 
                className={({ isActive }) => 
                  isActive ? "text-blue-600 font-medium p-2" : "text-gray-600 hover:text-gray-900 p-2"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Wallet
              </NavLink>
              <NavLink 
                to="/profile" 
                className={({ isActive }) => 
                  isActive ? "text-blue-600 font-medium p-2" : "text-gray-600 hover:text-gray-900 p-2"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </NavLink>
              <NavLink 
                to="/feedback" 
                className={({ isActive }) => 
                  isActive ? "text-blue-600 font-medium p-2" : "text-gray-600 hover:text-gray-900 p-2"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Send Feedback
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
