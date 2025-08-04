import React, { forwardRef } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        ref={ref}
        className={`mt-1 block w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${error ? 'border-red-500' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
);