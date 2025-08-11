// src/hooks/useOtherUserStatus.ts
import { ref, onValue } from 'firebase/database';
import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';

interface UserStatus {
  isOnline: boolean;
  lastActive: number;
}

// This hook takes another user's ID and their privacy setting
export const useOtherUserStatus = (userId: string | undefined, showOnlineStatus: boolean | undefined) => {
  const [status, setStatus] = useState<UserStatus>({ isOnline: false, lastActive: 0 });

  useEffect(() => {
    // If the user has disabled showing their status, don't even bother checking.
    if (!userId || !showOnlineStatus) {
      setStatus({ isOnline: false, lastActive: 0 });
      return;
    }
    
    const userStatusRef = ref(db, '/status/' + userId);
    console.log(userStatusRef)

    // Listen for changes to the other user's status
    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const value = snapshot.val();
      if (value) {
        setStatus({ isOnline: value.isOnline, lastActive: value.lastActive });
      } else {
        setStatus({ isOnline: false, lastActive: 0 });
      }
    });

    // Cleanup function to stop listening when the component unmounts
    return () => unsubscribe();

  }, [userId, showOnlineStatus]); // Rerun if the userId or their privacy setting changes

  return status;
};