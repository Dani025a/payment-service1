import { Request, Response } from 'express';
import { createPaymentSession, handlePaymentWebhook } from '../services/paymentService';
import { MESSAGES } from '../utils/messages';
import stripe from 'stripe';

export const createSession = async (req: Request, res: Response) => {
  try {
    const { amount, currency, orderId, metadata } = req.body;
    const session = await createPaymentSession(amount, currency, orderId, metadata);
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: MESSAGES.PAYMENT_SESSION_CREATION_ERROR });
  }
};

export const webhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    await handlePaymentWebhook(event);
    res.status(200).send('Webhook received');
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};