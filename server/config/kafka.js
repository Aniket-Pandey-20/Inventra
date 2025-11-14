import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'inventory-app',
  brokers: ['pkc-9q8rv.ap-south-2.aws.confluent.cloud:9092'],
  ssl: true, // 🔐 Required for Confluent Cloud
  sasl: {
    mechanism: 'plain',
    username: '5YT7PB44ZGWRXYPA',
    password: 'cflt6/0+hfRqvh3nt/VmCTHR2WREekR0NL4qTYwdyJkqhT+mlquNIeUj2NsyePkw'
  }
});

export default kafka;


// const kafka = new Kafka({
//   clientId: 'inventory-consumer',
//   brokers: [process.env.KAFKA_BROKER],
//   ssl: true,
//   sasl: {
//     mechanism: 'plain',
//     username: process.env.KAFKA_API_KEY,
//     password: process.env.KAFKA_API_SECRET
//   }
// });