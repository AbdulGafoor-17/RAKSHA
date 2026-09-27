import { Router } from 'express';
import { routeController } from '../controllers/routeController.js';

const router = Router();

router.post('/calculate', routeController.calculateEvacuationRoute);

export default router;
