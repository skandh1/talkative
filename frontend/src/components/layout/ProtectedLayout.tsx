// src/components/layout/ProtectedLayout.js
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { useDebounce } from 'use-debounce';


const UsernamePrompt = () => {
  const [username, setUsername] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const { completeGoogleSignup, checkUsername } = useAuth();
  
  const [debouncedUsername] = useDebounce(username, 500);

  useEffect(() => {
    if (debouncedUsername) {
      const validateUsername = async () => {
        setIsCheckingUsername(true);
        const available = await checkUsername(debouncedUsername);
        setIsUsernameAvailable(available);
        setIsCheckingUsername(false);
        if (!available) {
          toast.error('This username is already taken.');
        }
      };
      validateUsername();
    }
  }, [debouncedUsername, checkUsername]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isUsernameAvailable || isCheckingUsername) {
      if (!isUsernameAvailable) {
        toast.error('Please choose an available username.');
      }
      return;
    }
    if (username.trim()) {
      try {
        await completeGoogleSignup(username);
        toast.success('Username set successfully!');
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to set username.');
      }
    } else {
      toast.error('Username cannot be empty.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700 space-y-6">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Choose Your Username
        </h2>
        <p className="text-gray-400 text-center mb-4">
          Welcome! Please choose a unique username to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${isUsernameAvailable ? 'focus:ring-purple-500' : 'focus:ring-red-500'}`}
            />
          </div>
          <button
            type="submit"
            disabled={isCheckingUsername || !isUsernameAvailable}
            className={`w-full text-white rounded-xl px-4 py-3 font-semibold shadow-lg transition-all duration-300 ${
              isCheckingUsername || !isUsernameAvailable
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isCheckingUsername ? 'Checking...' : 'Save Username'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ProtectedLayout = () => {
  const { currentUser, showUsernamePrompt } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  // If the user is logged in but hasn't set a username, show the prompt
  if (showUsernamePrompt) {
    return <UsernamePrompt />;
  }

  // Otherwise, render the nested protected routes
  return <Outlet />;
};

export default ProtectedLayout;
