import express from 'express';
import {
  getEmployeePerformance,
  getTeamPerformanceOverview,
  getDashboardSummary,
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Individual performance (self or target employee for manager/admin)
router.get('/performance', getEmployeePerformance);
router.get('/performance/:employeeId', getEmployeePerformance);

// Manager / Admin views
router.get('/team', authorize('admin', 'manager'), getTeamPerformanceOverview);
router.get('/summary', authorize('admin', 'manager'), getDashboardSummary);

export default router;
