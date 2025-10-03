import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useToken = () => {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchToken = async () => {
    try {
      setLoading(true);
      const freshToken = await getToken();
      setToken(freshToken);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  return { token, loading, error, refresh: fetchToken };
};