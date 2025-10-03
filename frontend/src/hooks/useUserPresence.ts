// src/hooks/useUserPresence.ts
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { useEffect } from 'react';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';

export const useUserPresence = () => {
  const { dbUser: user } = useAuth();

  useEffect(() => {
    if (!user) {
      // User is not logged in, we do nothing.
      return;
    }

    const userStatusDatabaseRef = ref(db, '/status/' + user.uid);
    const isConnectedRef = ref(db, '.info/connected');

    // 1. Set up the onDisconnect hook immediately.
    onDisconnect(userStatusDatabaseRef)
      .set({ isOnline: false, lastActive: serverTimestamp() })
      .catch((err) => console.error("Could not set onDisconnect:", err));

    // 2. Listen for connection changes to set the user online.
    const unsubscribe = onValue(isConnectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // We are connected, so set the user to online.
        set(userStatusDatabaseRef, { isOnline: true, lastActive: serverTimestamp() });
      }
    });

    // 3. Cleanup function to cancel onDisconnect and listener when component unmounts.
    return () => {
      // Manually cancel the onDisconnect hook on the server.
      onDisconnect(userStatusDatabaseRef).cancel().catch((err) => console.error("Could not cancel onDisconnect:", err));
      // Unsubscribe the onValue listener.
      unsubscribe();
    };
  }, [user]);
};

// You must also add a manual logout function that sets the user offline:
// Example in your AuthContext or a logout component:
// const handleLogout = async () => {
//   if (user) {
//     const userStatusDatabaseRef = ref(db, '/status/' + user.uid);
//     await set(userStatusDatabaseRef, { isOnline: false, lastActive: serverTimestamp() });
//   }
//   await auth.signOut();
// };