import { Router } from 'express';
import bodyParser from 'body-parser';
import { createSession, webhook } from '../controllers/paymentController';

const router = Router();

router.post('/create-session', createSession);

export default router;
