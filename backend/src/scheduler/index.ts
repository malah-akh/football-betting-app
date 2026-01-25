import cron from 'node-cron';
import { MatchIngestionProducer } from '../producers/matchIngestion.js';

export function startScheduler() {
  console.log('⏰ Scheduler started');

  // 1. Live Matches: Every 15 seconds (Simulated "Live" polling)
  // In prod, this might be tighter, but for API quota safety we start with 30s or 1m
  if (process.env.DISABLE_LIVE_UPDATES === 'true') {
    console.log('🚫 Live updates disabled by config');
  } else {
    cron.schedule('*/30 * * * * *', async () => {
        await MatchIngestionProducer.fetchAndPublishLiveMatches();
    });
  }

  // 2. Upcoming Matches for Today: Every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
      await MatchIngestionProducer.fetchAndPublishMatches(new Date());
  });

  // 3. Tomorrow's Matches: Every 6 hours
  cron.schedule('0 */6 * * *', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await MatchIngestionProducer.fetchAndPublishMatches(tomorrow);
  });
}
