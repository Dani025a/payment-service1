import RabbitMQConnection from './connection';

class PaymentPublisher {
  private static instance: PaymentPublisher;
  private rabbitMQ: RabbitMQConnection;

  private constructor(rabbitMQ: RabbitMQConnection) {
    this.rabbitMQ = rabbitMQ;
  }

  public static async getInstance(): Promise<PaymentPublisher> {
    if (!PaymentPublisher.instance) {
      const rabbitMQ = await RabbitMQConnection.getInstance();
      PaymentPublisher.instance = new PaymentPublisher(rabbitMQ);
    }
    return PaymentPublisher.instance;
  }

  public async publishPaymentSuccess(message: object): Promise<void> {
    try {
      const exchange = 'payment_exchange';
      const routingKey = 'payment.success';

      await this.rabbitMQ.publish(exchange, routingKey, message, 'direct');
      console.log('Payment success message published:', message);
    } catch (error) {
      console.error('Error publishing payment success message:', error);
    }
  }

  public async publishPaymentFailed(message: object): Promise<void> {
    try {
      const exchange = 'payment_exchange';
      const routingKey = 'payment.failed';

      await this.rabbitMQ.publish(exchange, routingKey, message, 'direct');
      console.log('Payment failed message published:', message);
    } catch (error) {
      console.error('Error publishing payment failed message:', error);
    }
  }
}

export default PaymentPublisher;
