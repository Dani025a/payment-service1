import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';

class RabbitMQConnection {
  private static instance: RabbitMQConnection;
  private connection!: Connection;
  private channel!: Channel;

  private constructor() {}

  public static async getInstance(): Promise<RabbitMQConnection> {
    if (!RabbitMQConnection.instance) {
      RabbitMQConnection.instance = new RabbitMQConnection();
      await RabbitMQConnection.instance.connect();
    }
    return RabbitMQConnection.instance;
  }

  private async connect(): Promise<void> {
    try {
      const url = process.env.RABBITMQ_URL;
      if (!url) {
        throw new Error('RABBITMQ_URL is not defined in environment variables');
      }
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      console.log('RabbitMQ connection established');
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  public async publish(
    exchange: string,
    routingKey: string,
    message: any,
    type: 'fanout' | 'direct' | 'topic' = 'direct'
  ): Promise<void> {
    try {
      await this.channel.assertExchange(exchange, type, { durable: true });
      const messageBuffer = Buffer.from(
        typeof message === 'string' ? message : JSON.stringify(message)
      );
      this.channel.publish(exchange, routingKey, messageBuffer);
      console.log(`Message published to exchange '${exchange}' with routingKey '${routingKey}':`, message);
    } catch (error) {
      console.error('Error publishing message:', error);
    }
  }

  public async consume(
    queue: string,
    onMessage: (message: ConsumeMessage | null) => void,
    exchange?: string,
    routingKey: string = ''
  ): Promise<void> {
    try {
      if (exchange) {
        await this.channel.assertExchange(exchange, 'direct', { durable: true });
        await this.channel.assertQueue(queue, { durable: true });
        await this.channel.bindQueue(queue, exchange, routingKey);
      } else {
        await this.channel.assertQueue(queue, { durable: true });
      }

      await this.channel.consume(queue, (message: any) => {
        if (message) {
          onMessage(message);
          this.channel.ack(message);
        }
      });

      console.log(`Consuming messages from queue '${queue}'`);
    } catch (error) {
      console.error('Error consuming messages:', error);
    }
  }

  public async close(): Promise<void> {
    try {
      await this.channel.close();
      await this.connection.close();
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }
}

export default RabbitMQConnection;
