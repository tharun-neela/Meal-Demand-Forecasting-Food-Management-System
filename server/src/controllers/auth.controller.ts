import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MOCK_USERS, UserRole } from '../data/mockUsers';

const JWT_SECRET = process.env.JWT_SECRET || 'lpu_mess_super_secret_jwt_key_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const login = async (req: Request, res: Response) => {
  try {
    const { userId, password, role } = req.body;

    if (!userId || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'User ID, Password, and Role selection are all required.',
      });
    }

    // Lookup user in mock store (case-insensitive trim)
    const normalizedUserId = String(userId).trim().toLowerCase();
    const user = MOCK_USERS.find(
      (u) => u.userId.toLowerCase() === normalizedUserId
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User ID not found.',
      });
    }

    // Role-Based Access Control (RBAC) Enforcement
    // Prevents privilege escalation (e.g. Student trying to login as Mess Manager)
    if (user.role !== (role as UserRole)) {
      return res.status(403).json({
        success: false,
        message: `RBAC Access Denied: User "${user.userId}" is authorized only as "${user.role}", but attempted to login with the "${role}" role.`,
        authorizedRole: user.role,
        attemptedRole: role,
      });
    }

    // Verify Password using bcrypt hash comparison
    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // Generate Secure JWT Token containing RBAC payload
    const token = jwt.sign(
      {
        userId: user.userId,
        name: user.name,
        role: user.role,
        permissions: user.allowedPermissions,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: `Authentication successful as ${user.role}`,
      token,
      user: {
        userId: user.userId,
        name: user.name,
        role: user.role,
        email: user.email,
        permissions: user.allowedPermissions,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server authentication error.',
    });
  }
};

export const getMe = (req: Request, res: Response) => {
  // @ts-ignore (injected by auth middleware)
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated.' });
  }
  return res.status(200).json({ success: true, user });
};
