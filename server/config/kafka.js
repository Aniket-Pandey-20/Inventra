import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const kafka = new Kafka({
  clientId: 'inventory-app',
  brokers: process.env.KAFKA_BROKER.split(","),
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_API_KEY,
    password: process.env.KAFKA_API_SECRET
  },
  connectionTimeout: 10000, // 10s
  requestTimeout: 10000,
  retry: { retries: 4 }
});

export default kafka;
