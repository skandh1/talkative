import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProtectedData } from '../services/api';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        try {
          const response = await getProtectedData(currentUser);
          const token = await currentUser?.getIdToken();
          console.log('ID Token:', token);
          setData(response);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [currentUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {currentUser?.email}</p>
      <button onClick={logout}>Logout</button>
      {data && (
        <div>
          <h2>Protected Data</h2>

          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Dashboard;