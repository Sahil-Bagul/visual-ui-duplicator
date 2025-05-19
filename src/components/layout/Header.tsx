
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-[993px] mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <NavLink to="/dashboard" className="text-lg font-bold text-gray-900">Learn & Earn</NavLink>
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-14 right-0 left-0 bg-white z-50 border-b border-gray-200">
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
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
