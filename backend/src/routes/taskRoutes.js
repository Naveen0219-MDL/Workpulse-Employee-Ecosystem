import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTaskProgress,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('admin', 'manager'), createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.patch('/:id/progress', updateTaskProgress);
router.put('/:id', authorize('admin', 'manager'), updateTask);
router.delete('/:id', authorize('admin', 'manager'), deleteTask);

export default router;
