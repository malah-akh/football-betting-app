import { Kafka, logLevel } from 'kafkajs';

const BROKERS = process.env.REDPANDA_BROKERS?.split(',') || ['localhost:9092'];
const CLIENT_ID = process.env.REDPANDA_CLIENT_ID || 'football-betting-backend';

const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: BROKERS,
  logLevel: logLevel.ERROR,
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

export const requestProducer = kafka.producer();
export const responseConsumer = kafka.consumer({ groupId: 'match-ingestion-group' });

export const TOPICS = {
  MATCH_INGESTION: 'match_ingestion',
  ODDS_INGESTION: 'odds_ingestion',
} as const;

export async function connectRedpanda() {
  try {
    await requestProducer.connect();
    console.log('✅ Redpanda Producer connected');
    
    // Consumers connect when they are started, but we could initialize here if we wanted strict startup checks
    
  } catch (error) {
    console.error('❌ Redpanda connection error:', error);
    process.exit(1); 
  }
}
