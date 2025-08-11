import React from 'react'

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-sm">
    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);


export default StatCard