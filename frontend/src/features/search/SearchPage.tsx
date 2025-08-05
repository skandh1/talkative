import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDebounce } from './hooks/useDebounce';
import { type User } from '../../types/user'; // Assuming this is your user type
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/customUI/spinner"; // Assuming a simple spinner component
import { Link } from 'react-router-dom'; // Assuming you use react-router-dom
import { useToken } from '@/hooks/useToken';

const API_BASE_URL = 'http://localhost:5000/api/users';

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the custom debounce hook to delay the API call
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { token } = useToken();

  useEffect(() => {
    // Only call the API if the debounced term has a value
    if (debouncedSearchTerm) {
      const fetchResults = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Make the API call to the new backend search endpoint
          const response = await axios.get(`${API_BASE_URL}/search?q=${debouncedSearchTerm}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setSearchResults(response.data.users);
        } catch (err) {
          console.error("Failed to fetch search results:", err);
          setError("Failed to fetch search results. Please try again.");
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchResults();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="flex flex-col items-center p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Find a User
        </h1>
        <Input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-lg p-4 rounded-xl shadow-lg border-2 border-indigo-200 dark:border-indigo-800"
        />
      </div>

      <div className="w-full max-w-2xl mt-8">
        {isLoading && (
          <div className="flex justify-center items-center">
            <Spinner />
            <p className="ml-2 text-gray-600 dark:text-gray-400">Searching...</p>
          </div>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {!isLoading && debouncedSearchTerm && searchResults.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">No users found for "{debouncedSearchTerm}".</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {!isLoading && searchResults.length > 0 && searchResults.map((user) => (
            <Link key={user.id} to={`/profile/${user._id}`} className="group block">
              <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all hover:shadow-xl group-hover:scale-[1.02]">
                <img
                  src={user.profilePic || 'https://via.placeholder.com/64'}
                  alt={user.username}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/50"
                />
                <div className="flex-1">
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{user.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
