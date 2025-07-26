import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Coins, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Clubs', path: '/clubs' },
    { name: 'Coins', path: '/coins' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            Talkitive
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'text-indigo-600 border-b-2 border-indigo-600 pb-4'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side - User info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
            <Coins className="w-4 h-4" />
            <span className="text-sm font-medium">1,250</span>
          </div>
          
          <button className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              2
            </span>
          </button>
          
          <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Me</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;