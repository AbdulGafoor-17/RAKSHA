import { Router } from 'express';
import { authController } from '../controllers/authController.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.getMe);
router.post('/demo-switch', authController.demoSwitch);

export default router;
