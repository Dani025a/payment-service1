import Stripe from 'stripe';
import { prisma } from '../models';
import PaymentPublisher from '../rabbitmq/publisher'
import { MESSAGES } from '../utils/messages';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});


export async function createPaymentSession(
  amount: number,
  currency: string,
  orderId: string,
  metadata: Record<string, any>
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: 'Product Name' },
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
    console.error('[createPaymentSession] Error:', error);
    throw new Error(MESSAGES.PAYMENT_SESSION_CREATION_ERROR);
  }
}

export async function handlePaymentWebhook(event: Stripe.Event) {
  try {
    console.log('[handlePaymentWebhook] Received event:', event.type);
    const paymentPublisher = await PaymentPublisher.getInstance();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      await prisma.payment.create({
        data: {
          stripeSessionId: session.id,
          amount: session.amount_total || 0,
          currency: session.currency || '',
          status: 'success',
          metadata: session.metadata as any,
          orderId: session.metadata?.orderId || '',
        },
      });

      await paymentPublisher.publishPaymentSuccess({
        sessionId: session.id,
        metadata: session.metadata,
      });
    } else if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;

      await prisma.payment.create({
        data: {
          stripeSessionId: session.id,
          amount: session.amount_total || 0,
          currency: session.currency || '',
          status: 'failure',
          metadata: session.metadata as any,
          orderId: session.metadata?.orderId || '',
        },
      });

      await paymentPublisher.publishPaymentFailed({
        sessionId: session.id,
        metadata: session.metadata,
      });
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      await prisma.payment.create({
        data: {
          stripeSessionId: paymentIntent.id,
          amount: paymentIntent.amount_received || 0,
          currency: paymentIntent.currency || '',
          status: 'failure',
          metadata: paymentIntent.metadata as any,
          orderId: paymentIntent.metadata?.orderId || '',
        },
      });

      // Publish payment failure
      await paymentPublisher.publishPaymentFailed({
        sessionId: paymentIntent.id,
        metadata: paymentIntent.metadata,
      });
    } else {
      console.log('[handlePaymentWebhook] No action for event type:', event.type);
    }
  } catch (error) {
    console.error('[handlePaymentWebhook] Error:', error);
    throw new Error(MESSAGES.PAYMENT_WEBHOOK_ERROR);
  }
}