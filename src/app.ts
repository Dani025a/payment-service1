// src/app.ts
import express from 'express';
import cors from 'cors';
import paymentRoutes from './routes/paymentRoutes';
import { webhook } from './controllers/paymentController';
import { handlePaymentWebhook } from './services/paymentService';

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));

app.post('/webhook', express.json(), async (request, response) => {
  try {
    const event = request.body
    console.log(event)
    await handlePaymentWebhook(event);
    response.send();
  } catch (err) {
    console.log(err);
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
});


app.use(express.json());

app.use('/api/payments', paymentRoutes);

export default app;
