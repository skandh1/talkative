import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import your NEW layout component
import ProtectedLayout from './components/layout/ProtectedLayout';
import Navbar from './components/Navbar';

// Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Clubs = lazy(() => import('./pages/Clubs'));
const Explore = lazy(() => import('./pages/Explore'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

const LoadingSpinner: React.FC = () => <div>Loading...</div>;

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Navbar />
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<LandingPage />} />

            {/* Use the new ProtectedLayout for the nested routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="home" element={<Home />} />
              <Route path="profile" element={<Profile />} />
              <Route path="clubs" element={<Clubs />} />
              <Route path="explore" element={<Explore />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;