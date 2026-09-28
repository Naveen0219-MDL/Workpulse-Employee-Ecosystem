import express from 'express';
import {
  punchIn,
  punchOut,
  getTodayStatus,
  getWeeklyHours,
  getLiveAttendanceRoster,
} from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);
router.get('/today', getTodayStatus);
router.get('/weekly', getWeeklyHours);
router.get('/roster', authorize('admin', 'manager'), getLiveAttendanceRoster);

export default router;
