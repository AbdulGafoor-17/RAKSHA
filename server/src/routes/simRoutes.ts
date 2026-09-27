import { Router } from 'express';
import { simController } from '../controllers/simController.js';

const router = Router();

router.post('/inject-hazard', simController.injectHazard);
router.post('/block-active-route', simController.blockActiveRoute);
router.post('/scenario', simController.triggerScenario);
router.post('/reset', simController.resetDemoData);

export default router;
