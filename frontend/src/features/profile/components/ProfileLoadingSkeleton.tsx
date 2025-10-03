// components/LoadingSkeleton.tsx
import React from 'react';

export const ProfileLoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden p-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
        </div>
        
        {/* Profile Header Skeleton */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-28 h-28 md:w-40 md:h-40 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-64 animate-pulse mx-auto md:mx-0"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse mx-auto md:mx-0"></div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16 animate-pulse"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20 animate-pulse"></div>
            </div>
            <div className="flex gap-4 justify-center md:justify-start">
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Profile Details Skeleton */}
        <div className="space-y-4 mt-8">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="space-y-4 mt-8">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-40 animate-pulse"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};