import express from 'express';
import {
  createQuery,
  getQueries,
  replyToQuery,
  updateQueryStatus,
} from '../controllers/queryController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createQuery);
router.get('/', getQueries);
router.post('/:id/reply', replyToQuery);
router.patch('/:id/status', updateQueryStatus);

export default router;
