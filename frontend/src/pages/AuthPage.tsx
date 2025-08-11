// src/pages/AuthPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDebounce } from 'use-debounce';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [usernameForPrompt, setUsernameForPrompt] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isPasswordless, setIsPasswordless] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const {
    loginWithEmail,
    signupWithEmail,
    resetPassword,
    loginWithGoogle,
    showUsernamePrompt,
    completeGoogleSignup,
    currentUser,
    dbUser,
    checkUsername,
    sendPasswordlessLink,
  } = useAuth();
  const navigate = useNavigate();

  const [debouncedUsername] = useDebounce(usernameForPrompt, 500);

  useEffect(() => {
    if (showUsernamePrompt && debouncedUsername) {
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
  }, [showUsernamePrompt, debouncedUsername, checkUsername]);

  useEffect(() => {
    if (showUsernamePrompt && currentUser && !usernameForPrompt) {
      const suggestedName = currentUser.displayName || currentUser.email?.split('@')[0] || '';
      setUsernameForPrompt(suggestedName);
    }
  }, [showUsernamePrompt, currentUser, usernameForPrompt]);

  useEffect(() => {
    if (currentUser && dbUser && dbUser.username && !showUsernamePrompt) {
      navigate('/dashboard');
    }
  }, [currentUser, dbUser, showUsernamePrompt, navigate]);

  const handleAuth = async (event) => {
    event.preventDefault();

    if (isPasswordless) {
      try {
        await sendPasswordlessLink(email);
        toast.success('Check your email for a login link!');
        setLinkSent(true); 
      } catch (err) {
        console.error(err);
        toast.error('Failed to send login link. Please try again.');
      }
      return;
    }
    
    if (isSignUp) {
      try {
        setEmailVerificationSent(true);
        await signupWithEmail(email, password);
        toast.success('Account created. Please check your email to verify and log in!');
      } catch (err) {
        console.error(err);
        let errorMessage = 'An unexpected error occurred.';
        if (err.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already in use.';
        } else if (err.code === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters.';
        } else if (err.message) {
          errorMessage = err.message;
        }
        toast.error(errorMessage);
        setEmailVerificationSent(false);
      }
      return;
    }

    // Login logic
    try {
      await loginWithEmail(email, password);
      toast.success('Logged in successfully!');
    } catch (err) {
      console.error(err);
      let errorMessage = 'An unexpected error occurred.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  };

  const handleCompleteGoogleSignup = async (event) => {
    event.preventDefault();
    if (!isUsernameAvailable || isCheckingUsername) {
      toast.error('Please choose an available username.');
      return;
    }
    try {
      await completeGoogleSignup(usernameForPrompt);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address to reset the password.');
      return;
    }
    try {
      await resetPassword(email);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (err) {
      console.error(err);
      let errorMessage = 'Failed to send password reset email. Please check the email address.';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No user found with that email address.';
      }
      toast.error(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      toast.error('Failed to log in with Google.');
    }
  };

  if (showUsernamePrompt) {
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
          <form onSubmit={handleCompleteGoogleSignup} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={usernameForPrompt}
                onChange={(e) => setUsernameForPrompt(e.target.value)}
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
  }

  if (isPasswordless && linkSent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
        <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700 space-y-6">
          <h2 className="text-3xl font-bold text-center text-white mb-6">
            Check Your Email
          </h2>
          <p className="text-gray-400 text-center">
            A secure login link has been sent to **{email}**. Please click the link to continue.
          </p>
          <button
            onClick={() => {
              setIsPasswordless(false);
              setLinkSent(false);
            }}
            className="text-sm text-center text-gray-400 hover:text-white transition-colors w-full mt-4"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  if (isSignUp && emailVerificationSent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
        <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700 space-y-6">
          <h2 className="text-3xl font-bold text-center text-white mb-6">
            Verify Your Email
          </h2>
          <p className="text-gray-400 text-center">
            An email verification link has been sent to **{email}**. Please click the link to verify your account and then log in.
          </p>
          <button
            onClick={() => {
              setEmailVerificationSent(false);
              setIsSignUp(false);
            }}
            className="text-sm text-center text-gray-400 hover:text-white transition-colors w-full mt-4"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
      <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700 space-y-6">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {isPasswordless ? 'Passwordless Login' : (isSignUp ? 'Create an Account' : 'Welcome Back!')}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            />
          </div>
          
          {!isPasswordless && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full text-white rounded-xl px-4 py-3 font-semibold shadow-lg transition-all duration-300 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 hover:shadow-xl transform hover:scale-105"
          >
            {isSignUp ? 'Sign Up' : (isPasswordless ? 'Send Login Link' : 'Log In')}
          </button>
        </form>

        {!isSignUp && !isPasswordless && (
          <button
            onClick={handleResetPassword}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors text-center w-full"
          >
            Forgot Password?
          </button>
        )}

        <div className="flex items-center space-x-2 my-4">
          <span className="flex-grow border-t border-gray-600"></span>
          <span className="text-gray-400 text-sm font-medium">or</span>
          <span className="flex-grow border-t border-gray-600"></span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl px-8 py-4 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
        >
          <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign In with Google
        </button>

        <button
          onClick={() => {
            if (isPasswordless) {
              setIsPasswordless(false);
              setEmailVerificationSent(false);
            } else {
              setIsSignUp(!isSignUp);
              setLinkSent(false);
            }
          }}
          className="text-sm text-center text-gray-400 hover:text-white transition-colors w-full"
        >
          {isSignUp ? 'Already have an account? Log In' : (isPasswordless ? 'Back to Login' : 'Need an account? Sign Up')}
        </button>
        
        {!isSignUp && !isPasswordless && (
          <button
            onClick={() => setIsPasswordless(true)}
            className="text-sm text-center text-purple-400 hover:text-white transition-colors w-full mt-2"
          >
            Or, sign in with a magic link
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthPage;