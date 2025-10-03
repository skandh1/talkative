import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../firebase-admin';
import { User } from '../models/User';

export interface DecodedToken {
  uid: string;
  email?: string;
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}


export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    
    // Step 1: Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Step 2: Find MongoDB user with uid or email
    let user = await User.findOne({ uid: decodedToken.uid });
    // if (!user && decodedToken.email) {
    //   // optionally auto-create a user in Mongo if not found
    //   user = await User.create({
    //     firebaseUid: decodedToken.uid,
    //     email: decodedToken.email,
    //   });
    // }

    if (!user) {
      return res.status(401).json({ error: 'User not found in database' });
    }
    
    // Step 3: Attach MongoDB user to request
    req.user = user.toObject(); // or just user if you prefer Mongoose doc
    next();

  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};