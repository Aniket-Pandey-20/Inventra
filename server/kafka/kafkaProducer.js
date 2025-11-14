import kafka from '../config/kafka.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Send inventory event to Kafka
 * @param {string} topic - Kafka topic name
 * @param {Object} payload - Event payload
 */
export async function sendInventoryEvent(topic, payload) {
  try {
    const key = payload.event_id || uuidv4();
    const producer = kafka.producer();
    await producer.connect();

    await producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(payload)
        }
      ]
    });

    console.log(`Event sent to ${topic} | key: ${key}`);
    return key;
  } catch (err) {
    console.error(`Failed to send event to ${topic}:`, err);
    throw err;
  }
}