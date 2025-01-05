import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import logo from './wotg-logo.png';

import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

function Navbar() {
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = Cookies.get('authenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = () => {
    dispatch(wotgsocial.user.userLogout())
  };

  return (
    <nav className="bg-[#c0392b] shadow-md sticky top-0 w-full z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex flex-1 items-center justify-between space-x-4">
            <div className="flex-shrink-0">
              <a href="/">
                <img src={logo} alt="MyLogo" className="h-16 w-auto" />
              </a>
            </div>
            <div className="hidden md:flex space-x-4">
              {isAuthenticated ? (
                <a 
                  onClick={handleSignOut} 
                  className="text-white hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer"
                >
                  Logout
                </a>              
              ) : (
                <a href="/login" className="text-white hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">Login</a>
              )}
            </div>
          </div>
          <div className="flex md:hidden">
            <button
              type="button"
              className="text-white hover:text-blue-600 focus:outline-none focus:text-blue-600"
              onClick={toggleMenu}
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a href="/" className="text-white hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300">Home</a>
          {isAuthenticated ? (
            <a 
              onClick={handleSignOut} 
              className="text-white hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 cursor-pointer"
            >
              Logout
            </a>
          ) : (
            <a href="/login" className="text-white hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300">Login</a>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
