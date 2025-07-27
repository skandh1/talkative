import { DecodedToken } from '../middleware/auth'; // Relative import

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken; // Now uses the correct type
    }
  }
}