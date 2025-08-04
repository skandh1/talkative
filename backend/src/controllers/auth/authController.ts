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

