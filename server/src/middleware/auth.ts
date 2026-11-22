import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, type IUser, type Role } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'preppulse_dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(user: { _id: unknown; role: Role }) {
  return jwt.sign({ sub: String(user._id), role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const payload = jwt.verify(token, JWT_SECRET) as { sub?: string };
    if (!payload.sub) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'Account no longer exists.' });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}

/** Role guard: attach after requireAuth. */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only.' });
  }
  return next();
}
