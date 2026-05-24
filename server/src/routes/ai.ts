import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.post('/scenario', AIController.generateScenario);
router.post('/evaluate', AIController.evaluateResponse);

export default router;
