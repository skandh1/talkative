// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import UserProfile from '../components/userProfile';

const Profile = () => {
  const { identifier: username } = useParams<{ identifier?: string }>();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get current user's ID token
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        const token = await currentUser.getIdToken();
        
        const response = await fetch(
          `http://localhost:5000/api/users/username/${username}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Handle error (e.g., show error message)
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [username, auth]);

  if (loading) return <div>Loading......</div>;
  if (!userProfile) return <div>User not found.</div>;

  return <UserProfile profile={userProfile} />;
};

export default Profile;