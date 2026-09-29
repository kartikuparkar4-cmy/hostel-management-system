import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DB } from '../db.ts';

export const JWT_SECRET = process.env.JWT_SECRET || 'hostel-secret-jwt-key-default-2026';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'student';
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Access token missing or unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: 'admin' | 'student';
    };

    const user = await DB.findUserById(decoded.id);
    if (!user) {
      res.status(401).json({ error: 'User associated with token no longer exists' });
      return;
    }

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (role: 'admin' | 'student') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        error: `Forbidden: Only ${role} users can access this resource. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};
