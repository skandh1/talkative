// src/components/UserProfile.tsx
import { useOtherUserStatus } from '../hooks/useOtherUserStatus';

// Assume you fetch the full user profile from your MongoDB via your Express API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UserProfile = ({ profile}: { profile: any }) => {
  // profile.uid is the Firebase UID
  // profile.showOnlineStatus is the boolean from MongoDB
  const status = useOtherUserStatus(profile.uid, profile.showOnlineStatus);

  return (
    <div>
      <h1>{profile.displayName}</h1>
      {profile.showOnlineStatus ? (
        <div>
          <span style={{
            height: '10px',
            width: '10px',
            backgroundColor: status.isOnline ? 'green' : 'grey',
            borderRadius: '50%',
            display: 'inline-block',
            marginRight: '8px'
          }}></span>
          {status.isOnline ? 'Online' : 'Offline'}
        </div>
      ) : (
        <div>Status Hidden</div>
      )}
    </div>
  );
};

export default UserProfile;