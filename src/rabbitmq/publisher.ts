import RabbitMQ from './connection';

export const publishPaymentSuccess = async (message: object) => {
  const channel = await RabbitMQ.connect();
  channel.publish('payment.exchange', 'payment.success', Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};

export const publishPaymentFailure = async (message: object) => {
  const channel = await RabbitMQ.connect();
  channel.publish('payment.exchange', 'payment.failure', Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};
