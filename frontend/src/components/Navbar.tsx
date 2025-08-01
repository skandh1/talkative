import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Coins, User } from 'lucide-react';
import ThemeToggleButton from './themeToggleButton';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/firebase/firebase';

const Navbar: React.FC = () => {

  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/home' },
    { name: 'Clubs', path: '/clubs' },
    { name: 'Explore', path: '/explore' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Talkitive
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {currentUser &&
              navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm font-medium transition-colors duration-200 ${isActive(item.path)
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 pb-4'
                    : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
          </div>
        </div>

        {/* Right side - User info and Theme Toggle */}

        <div className="flex items-center space-x-4">
          {currentUser && (
            <>
              <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full">
                <Coins className="w-4 h-4" />
                <span className="text-sm font-medium">1,250</span>
              </div>

              <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  2
                </span>
              </button>

              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-2">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Me</span>
              </div>

              <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
            </>
          )}

          <ThemeToggleButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
