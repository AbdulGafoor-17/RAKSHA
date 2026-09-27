import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';

const router = Router();

router.get('/', reportController.getAllReports);
router.post('/', reportController.createReport);
router.patch('/:id/status', reportController.updateStatus);

export default router;
