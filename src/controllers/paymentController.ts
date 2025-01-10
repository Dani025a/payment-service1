import { Request, Response } from 'express';
import { createPaymentSession, handlePaymentWebhook } from '../services/paymentService';
import { MESSAGES } from '../utils/messages';
import stripe, { Stripe } from 'stripe';

export const createSession = async (req: Request, res: Response) => {
  try {
    const { amount, currency, orderId, metadata } = req.body;

    const session = await createPaymentSession(amount, currency, orderId, metadata);

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('[createSession] Error:', error);
    res.status(500).json({ error: MESSAGES.PAYMENT_SESSION_CREATION_ERROR });
  }
};

export const webhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('Missing Stripe signature');
    return res.status(400).send('Missing Stripe signature');
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    console.log('Received raw body:', req.body);
    console.log('Type of raw body:', typeof req.body);

    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('⚠️  Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await handlePaymentWebhook(event);
    res.status(200).send('Received');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Internal Server Error');
  }
};