import amqp, { Channel, Connection } from 'amqplib';

class RabbitMQ {
  private static connection: Connection;
  private static channel: Channel;

  static async connect() {
    if (!this.connection) {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange('payment.exchange', 'topic', { durable: true });
    }
    return this.channel;
  }

  static async close() {
    if (this.connection) {
      await this.connection.close();
    }
  }
}

export default RabbitMQ;
