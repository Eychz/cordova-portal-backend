import express from 'express';
import { changeLogController } from '../controllers/changeLogController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

// Only admin role can access change logs
router.use(authenticateToken);
router.use(authorizeRole('admin'));

router.get('/', changeLogController.getAllChangeLogs);
router.post('/', changeLogController.createChangeLog);
router.put('/:id', changeLogController.updateChangeLog);
router.delete('/:id', changeLogController.deleteChangeLog);

export default router;
