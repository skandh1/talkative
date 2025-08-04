import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebase';
import { getProtectedData } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const copyToClipboard = async (text: string) => {
    try {
      toast.success('cilipbaord copied successfully');
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };




  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      const fetchData = async () => {
        try {
          const protectedResponse = await getProtectedData(user);
          
          setData(protectedResponse);
        } catch (error) {
          console.error('Error fetching protected data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <p className="mb-2">Welcome, <strong>{user?.email}</strong></p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => copyToClipboard(data["idToken"])}
        >
          Copy to Clipboard
        </button>



        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Protected Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-80">
            {data ? JSON.stringify(data, null, 2) : 'No data available.'}
          </pre>
        </div>
      </div>
    </div>
  );
}
