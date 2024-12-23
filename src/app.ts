import express from 'express';
import paymentRoutes from './routes/paymentRoutes';
import cors from 'cors'
const app = express();
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

app.use(cors(corsOptions));

app.use('/api/payments', paymentRoutes);
export default app;
