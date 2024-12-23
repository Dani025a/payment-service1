import 'dotenv/config';
import app from './app';

const SmeeClient = require('smee-client');

const smee = new SmeeClient({
  source: 'https://smee.io/CtPmaeydmTd51',
  target: 'http://localhost:1006/events',
  logger: console
});

const events = smee.start();

const PORT = process.env.PORT || 1006;

app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));

