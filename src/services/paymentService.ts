import Stripe from 'stripe';
import { prisma } from '../models';
import { publishPaymentSuccess, publishPaymentFailure } from '../rabbitmq/publisher';
import { MESSAGES } from '../utils/messages';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export const createPaymentSession = async (amount: number, currency: string, orderId: string, metadata: object) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Product Name',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/order-confirmation`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      metadata: { ...metadata, orderId },
    });

    return session;
  } catch (error) {
    console.error(error);
    throw new Error(MESSAGES.PAYMENT_SESSION_CREATION_ERROR);
  }
};

export const handlePaymentWebhook = async (event: Stripe.Event) => {
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      await prisma.payment.create({
        data: {
          stripeSessionId: session.id,
          amount: session.amount_total || 0,
          currency: session.currency,
          status: 'success',
          metadata: session.metadata as any,
          orderId: session.metadata?.orderId || '',
        },
      });

      await publishPaymentSuccess({
        sessionId: session.id,
        metadata: session.metadata,
      });
    } else if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;

      await prisma.payment.create({
        data: {
          stripeSessionId: session.id,
          amount: session.amount_total || 0,
          currency: session.currency,
          status: 'failure',
          metadata: session.metadata as any,
          orderId: session.metadata?.orderId || '',
        },
      });

      await publishPaymentFailure({
        sessionId: session.id,
        metadata: session.metadata,
      });
    }
  } catch (error) {
    console.error(error);
    throw new Error(MESSAGES.PAYMENT_WEBHOOK_ERROR);
  }
};