import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DB } from '../db.ts';
import { JWT_SECRET, authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// POST /api/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, adminCode } = req.body;

    // Field validation
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (!email || !email.trim() || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email address is required' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }
    if (!role || (role !== 'admin' && role !== 'student')) {
      res.status(400).json({ error: 'Role must be either "admin" or "student"' });
      return;
    }

    // Admin secret code check
    if (role === 'admin') {
      const requiredAdminCode = process.env.ADMIN_CODE || 'warden123';
      if (!adminCode || adminCode.trim() !== requiredAdminCode.trim()) {
        res.status(403).json({
          error: 'Invalid admin registration code. Please enter the correct secret warden code.',
        });
        return;
      }
    }

    // Check duplicate email
    const existing = await DB.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    // Hash password & create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await DB.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
    });

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await DB.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // If client specified a role, verify that user has that role
    if (role && user.role !== role) {
      res.status(403).json({
        error: `Account registered as '${user.role}'. Please select '${user.role}' to log in.`,
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET /api/me (Current user session)
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ user: req.user });
});

export default router;
