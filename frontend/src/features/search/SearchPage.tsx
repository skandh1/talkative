import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { type User } from '../../types/user';
import { Input } from "../../components/ui/input";
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Search, User as UserIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';

// --- Custom Hooks ---
// You will need a simple debounce hook. If you don't have one, here's a basic implementation:
// eslint-disable-next-line react-refresh/only-export-components
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const API_BASE_URL = 'http://localhost:5000/api/users';

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();

  // Helper to determine if the search term is a valid MongoDB ObjectId
  const isMongoId = (str: string) => /^[0-9a-fA-F]{24}$/.test(str);
  
  // Use a local debounce hook or a library like 'use-debounce'
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchResults = async () => {
      // Clear previous results and error messages
      setSearchResults(null);
      if (!debouncedSearchTerm) {
        return;
      }
      
      setIsLoading(true);

      try {
        const token = await getToken();
        let url;
        const isById = isMongoId(debouncedSearchTerm);
        
        if (isById) {
          url = `${API_BASE_URL}/id/${debouncedSearchTerm}`;
        } else {
          url = `${API_BASE_URL}/username/${debouncedSearchTerm}`;
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // The API might return a single user or an array
        const fetchedUsers = Array.isArray(response.data) ? response.data : [response.data];
        setSearchResults(fetchedUsers);
        
        if (fetchedUsers.length === 0) {
          toast.info("No users found.");
        }

      } catch (err) {
        console.error("Failed to fetch search results:", err);
        const errorMessage = (err as any).response?.data?.message || "Failed to fetch search results. Please try again.";
        toast.error(errorMessage);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearchTerm, getToken]);
  
  return (
    <div className="flex flex-col items-center p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 dark:text-white mb-6 md:mb-12">
          Find Your Friends
        </h1>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <Input
            type="text"
            placeholder="Search by username or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-lg rounded-full shadow-lg bg-white dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
          />
        </div>
      </div>

      <div className="w-full max-w-3xl mt-8">
        {isLoading && (
          <div className="flex justify-center items-center text-gray-600 dark:text-gray-400">
            <UserIcon className="animate-pulse mr-2" />
            <p>Searching...</p>
          </div>
        )}
        
        {!isLoading && searchResults?.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg">No users found for "{searchTerm}".</p>
          </div>
        )}

        <div className="space-y-4">
          {!isLoading && searchResults && searchResults.length > 0 && searchResults.map((user) => (
            <Link key={user._id} to={`/profile/${user.username}`} className="group block">
              <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md transition-all hover:shadow-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="relative">
                  <img
                    src={user.profilePic || 'https://placehold.co/64x64/2d3748/ffffff?text=U'}
                    alt={user.displayName || user.username}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/50 transition-all"
                  />
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 block w-4 h-4 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" title="Online" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {user.displayName}
                    </p>
                    {user.profileStatus === 'active' && (
                       <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">Active</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                </div>
                <Button 
                  asChild 
                  className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                >
                  <Link to={`/profile/${user.username}`}>View Profile</Link>
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

