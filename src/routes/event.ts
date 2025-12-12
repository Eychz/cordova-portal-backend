import express from 'express';
import { addEventToCalendar, getMyEvents, removeEvent } from '../controllers/eventController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/events', authenticateToken, addEventToCalendar);
router.get('/events', authenticateToken, getMyEvents);
router.delete('/events/:id', authenticateToken, removeEvent);

export default router;
