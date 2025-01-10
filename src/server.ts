// src/index.ts
import 'dotenv/config';
import app from './app';
import SmeeClient from 'smee-client';

const smee = new SmeeClient({
  source: 'https://smee.io/CtPmaeydmTd51',
  target: 'http://localhost:1006/webhook',
  logger: console,
});

smee.start();

const PORT = process.env.PAYMENT_PORT || 1006;

app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
