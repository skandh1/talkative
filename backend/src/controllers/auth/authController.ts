import { Request, Response } from 'express';
import { adminAuth } from '../../firebase-admin';
import { User } from '../../models/User';

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken.email || !decodedToken.email_verified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    const userRecord = await adminAuth.getUser(decodedToken.uid);
    const isFirstLogin = userRecord.metadata.creationTime === userRecord.metadata.lastSignInTime;

    const { isFirstLogin: clientClaimsFirstLogin, displayName, photoURL } = req.body;

    const user = await User.findOneAndUpdate(
      { email: decodedToken.email },
      {
        $setOnInsert: {
          email: decodedToken.email,
          username: displayName || decodedToken.name || 'User',
          profilePic: isFirstLogin && clientClaimsFirstLogin
            ? photoURL || decodedToken.picture || ''
            : undefined,
          coins: 0,
          rating: 0,
          callCount: 0,
          profileStatus: 'active',
        },
      },
      {
        upsert: true,
        new: true
      }
    );

    res.status(200).json({ user });

  } catch (error) {
    console.error('Google auth error:', error);

    if ((error as { code?: string }).code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};


/**
 * A generic authentication controller to sync Firebase users with the backend database.
 * This replaces the old googleAuth controller and is compatible with all Firebase
 * authentication methods (Google, email/password, etc.).
 */
export const setUsernameController = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Find the user by email
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found in database.' });
    }
    
    const { username } = req.body;
    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Invalid username.' });
    }

    // Check for username uniqueness
    const existingUserWithUsername = await User.findOne({ username });
    if (existingUserWithUsername) {
      return res.status(409).json({ error: 'Username is already taken.' });
    }

    // Update the user's username and set the flag
    user.username = username;
    user.hasSetUsername = true;
    await user.save();

    res.status(200).json({ message: 'Username set successfully', user });
  } catch (error) {
    console.error('Set username error:', error);
    if ((error as { code?: string }).code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const syncUserController = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken.email) {
      return res.status(403).json({ error: 'Email not provided in token' });
    }
    
    // Determine if it's a first time login or a returning user based on the Firebase token
    const firebaseUser = await adminAuth.getUser(decodedToken.uid);
    const isFirstLogin = firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime;

    // Use findOneAndUpdate with upsert: true for an atomic operation.
    // This prevents the duplicate key error.

    const {displayName} = req.body
    let user = await User.findOneAndUpdate(
      { email: decodedToken.email },
      {
        $setOnInsert: {
          email: decodedToken.email,
          displayName: displayName || decodedToken.name || decodedToken.email?.split('@')[0],
          profilePic: decodedToken.picture || '',
          coins: 0,
          rating: 0,
          callCount: 0,
          profileStatus: 'active',
          // For email sign-up, a username is provided on the front-end
          // For Google, it's left undefined to trigger the prompt
          username: req.body.username || undefined,
          hasSetUsername: !!req.body.username,
        },
        $set: {
          isOnline: true
        }
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.status(200).json({ user });
  } catch (error) {
    console.error('User sync error:', error);
    if ((error as { code?: string }).code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkUsernameController = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required.' });
    }
    
    const existingUser = await User.findOne({ username });
    
    // Return true if the username is available, false otherwise.
    res.status(200).json({ available: !existingUser });
    
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

