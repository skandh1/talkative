// src/components/RedirectIfAuthenticated.js (or .tsx if you prefer TypeScript)
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path if necessary

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const RedirectIfAuthenticated : React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if not loading and a user is present
    if (currentUser) {
      navigate('/dashboard', { replace: true }); // Use replace to prevent going back to auth page
    }
  }, [currentUser, navigate]);

  // Render children (the AuthPage) only if not authenticated or still loading
  // The redirect will happen when loading is false and currentUser is present
  return children;
};

export default RedirectIfAuthenticated;