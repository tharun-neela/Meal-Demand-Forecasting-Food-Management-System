import bcrypt from 'bcryptjs';

export type UserRole =
  | 'Student'
  | 'Kitchen Staff'
  | 'Mess Manager'
  | 'Mess Administrator'
  | 'Finance Officer'
  | 'Administrator';

export interface UserAccount {
  userId: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  email: string;
  allowedPermissions: string[];
}

// Generate pre-hashed passwords using bcrypt with 10 salt rounds
const DEFAULT_PASSWORD = 'password123';
const DEFAULT_SALT_ROUNDS = 10;
const HASHED_PASSWORD = bcrypt.hashSync(DEFAULT_PASSWORD, DEFAULT_SALT_ROUNDS);

export const MOCK_USERS: UserAccount[] = [
  {
    userId: '12204918',
    name: 'Tharun Neela',
    role: 'Student',
    passwordHash: HASHED_PASSWORD,
    email: 'tharun.student@lpu.in',
    allowedPermissions: ['menu:view', 'attendance:mark', 'feedback:submit']
  },
  {
    userId: 'KS-304',
    name: 'Gurpreet Singh',
    role: 'Kitchen Staff',
    passwordHash: HASHED_PASSWORD,
    email: 'gurpreet.kitchen@lpu.in',
    allowedPermissions: ['prep:view', 'ingredients:read', 'actuals:record']
  },
  {
    userId: 'MM-108',
    name: 'Rajesh Sharma',
    role: 'Mess Manager',
    passwordHash: HASHED_PASSWORD,
    email: 'rajesh.manager@lpu.in',
    allowedPermissions: ['forecast:view', 'prep:plan', 'waste:audit', 'recipes:manage']
  },
  {
    userId: 'MA-201',
    name: 'Dr. Neeraj Verma',
    role: 'Mess Administrator',
    passwordHash: HASHED_PASSWORD,
    email: 'neeraj.admin@lpu.in',
    allowedPermissions: ['calendar:configure', 'units:manage', 'reports:export', 'all:read']
  },
  {
    userId: 'FO-502',
    name: 'Anita Kapoor',
    role: 'Finance Officer',
    passwordHash: HASHED_PASSWORD,
    email: 'anita.finance@lpu.in',
    allowedPermissions: ['cost:analyze', 'waste:costing', 'procurement:audit']
  },
  {
    userId: 'admin',
    name: 'System Administrator',
    role: 'Administrator',
    passwordHash: HASHED_PASSWORD,
    email: 'admin.mess@lpu.in',
    allowedPermissions: ['*']
  }
];
