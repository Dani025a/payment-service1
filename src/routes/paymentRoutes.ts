import { Router } from 'express';
import { createSession, webhook } from '../controllers/paymentController';

const router = Router();

router.post('/create-session', createSession);
router.post('/webhook', webhook);

export default router;
