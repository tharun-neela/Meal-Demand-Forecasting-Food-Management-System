import { Router } from 'express';
import { getHealthStatus, getProjectInfo } from '../controllers/status.controller';
import { login, getMe } from '../controllers/auth.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/health', getHealthStatus);
router.get('/project-info', getProjectInfo);
router.post('/auth/login', login);

// Protected routes (Requires valid JWT)
router.get('/auth/me', authenticateJWT, getMe);

// Example RBAC Protected Route: Only Mess Manager and Administrators can access
router.get(
  '/manager/forecast-dashboard',
  authenticateJWT,
  requireRole('Mess Manager', 'Mess Administrator', 'Administrator'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Access granted to Mess Demand Forecasting & Inventory metrics.',
      data: {
        forecastedAttendance: 1420,
        estimatedWasteReduction: '18.4%',
      },
    });
  }
);

export default router;
