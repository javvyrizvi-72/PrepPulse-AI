import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { requireAuth, signToken, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user: any) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    targetRole: user.targetRole,
    experienceLevel: user.experienceLevel,
    streakCount: user.streakCount,
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, targetRole, experienceLevel } = req.body || {};

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ message: 'Please enter your full name.' });
    }
    if (!email || !EMAIL_RE.test(String(email))) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!password || String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const normalized = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalized });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Role is always student on public registration. Admin accounts are seeded only.
    const user = await User.create({
      name: String(name).trim(),
      email: normalized,
      passwordHash: await bcrypt.hash(String(password), 10),
      role: 'student',
      targetRole: targetRole ? String(targetRole).slice(0, 80) : 'Full Stack Developer',
      experienceLevel: ['fresher', '1-3 years', '3+ years'].includes(experienceLevel)
        ? experienceLevel
        : 'fresher',
      streakCount: 0,
    });

    return res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ message: 'Could not create your account. Try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
      '+passwordHash'
    );
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    return res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Sign in failed. Try again.' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  return res.json({ user: publicUser(req.user) });
});

/** PATCH /api/auth/profile — update name, target role, experience level. */
router.patch('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, targetRole, experienceLevel } = req.body || {};
    const user = req.user!;

    if (name !== undefined) {
      const clean = String(name).trim();
      if (clean.length < 2) {
        return res.status(400).json({ message: 'Name needs at least 2 characters.' });
      }
      user.name = clean.slice(0, 80);
    }
    if (targetRole !== undefined) {
      const clean = String(targetRole).trim();
      if (!clean) return res.status(400).json({ message: 'Target role cannot be empty.' });
      user.targetRole = clean.slice(0, 80);
    }
    if (experienceLevel !== undefined) {
      if (!['fresher', '1-3 years', '3+ years'].includes(experienceLevel)) {
        return res.status(400).json({ message: 'Choose a valid experience level.' });
      }
      user.experienceLevel = experienceLevel;
    }

    await user.save();
    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('profile update', err);
    return res.status(500).json({ message: 'Could not save your profile.' });
  }
});

/** POST /api/auth/password — change password with current-password check. */
router.post('/password', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Enter your current and new password.' });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    const user = await User.findById(req.user!._id).select('+passwordHash');
    if (!user) return res.status(404).json({ message: 'Account not found.' });

    const ok = await bcrypt.compare(String(currentPassword), user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect.' });

    user.passwordHash = await bcrypt.hash(String(newPassword), 10);
    await user.save();
    return res.json({ message: 'Password updated.' });
  } catch (err) {
    console.error('password change', err);
    return res.status(500).json({ message: 'Could not update your password.' });
  }
});

export default router;
