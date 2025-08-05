import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/themeContext';

import ProtectedLayout from './components/layout/ProtectedLayout';
import Navbar from './components/Navbar';
import { ProfilePage } from './features/profile/ProfilePage';
import { SearchPage } from './features/search/SearchPage';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Clubs = lazy(() => import('./pages/Clubs'));
const Explore = lazy(() => import('./pages/Explore'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Query Client instance
const queryClient = new QueryClient();

const LoadingSpinner: React.FC = () => <div className="text-center p-8">Loading...</div>;

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <Suspense fallback={<LoadingSpinner />}>
             <ToastContainer />
              <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                <Navbar />
                <main className="max-w-7xl mx-auto px-6 py-8">
                  <Routes>
                    {/* Public route */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Protected routes (require auth) */}
                    <Route element={<ProtectedLayout />}>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="home" element={<Home />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="clubs" element={<Clubs />} />
                      <Route path="explore" element={<Explore />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="profile/:profileId" element={<ProfilePage />} />
                      <Route path="me" element={<ProfilePage />} />
                      <Route path="search" element={<SearchPage />} />
                    </Route>

                    {/* Fallback for unknown   routes */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </Suspense>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
