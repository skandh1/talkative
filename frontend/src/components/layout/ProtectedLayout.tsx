import React from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

/**
 * This component acts as the layout for all protected routes.
 * 1. It wraps the content in <ProtectedRoute> to secure it.
 * 2. It uses <Outlet /> to render the actual page component (e.g., Dashboard, Profile).
 */
const ProtectedLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      {/* You can place a shared Navbar or Sidebar here */}
      <Outlet />
    </ProtectedRoute>
  );
};

export default ProtectedLayout;