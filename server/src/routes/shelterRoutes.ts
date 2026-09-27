import { Router } from 'express';
import { shelterController } from '../controllers/shelterController.js';

const router = Router();

router.get('/', shelterController.getAllShelters);
router.get('/nearest', shelterController.getNearestShelters);
router.get('/:id', shelterController.getShelterById);
router.patch('/:id/capacity', shelterController.updateCapacity);
router.patch('/:id/supplies', shelterController.updateSupplies);

export default router;
