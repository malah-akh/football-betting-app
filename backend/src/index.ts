import { startScheduler } from "./scheduler/index.js";
import { matchProcessor } from "./consumers/matchProcessor.js";
import { connectRedpanda } from "./config/redpanda.js";
import dotenv from "dotenv";
import http from "http";

dotenv.config();

const PORT = 5050;

import { MatchIngestionProducer } from "./producers/matchIngestion.js";

async function bootstrap() {
  console.log('🚀 Starting Backend Service (Event-Driven)...');
  
  // 1. Connect to Redpanda
  await connectRedpanda();
  
  // 2. Start Scheduler (Sentinel)
  startScheduler();

  // 3. Start Consumer (Processor)
  matchProcessor();

  // 4. Force Initial Fetch of Today's Matches (to populate data immediately)
  console.log('⚡️ Triggering initial full-day fetch...');
  await MatchIngestionProducer.fetchAndPublishMatches(new Date());
  
  // 4b. Force Initial Fetch of Today's Odds
  console.log('⚡️ Triggering initial odds fetch...');
  await MatchIngestionProducer.fetchAndPublishOdds(new Date());

  // 5. Start HTTP server (API + Health Check)
  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === "/api/ingest" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", async () => {
            try {
                const { date, matchId } = body ? JSON.parse(body) : { date: undefined, matchId: undefined };
                
                if (matchId) {
                    console.log(`[API] Manual ingest trigger for MATCH ID ${matchId}`);
                    await MatchIngestionProducer.fetchAndPublishMatch(Number(matchId));
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "success", message: `Ingest triggered for match ${matchId}` }));
                    return;
                }

                // Fix timezone issue when creating Date from info string YYYY-MM-DD
                const targetDate = date ? new Date(date + 'T12:00:00') : new Date();
                
                console.log(`[API] Manual ingest trigger for ${date || 'today'}`);
                
                // Trigger the producer
                await MatchIngestionProducer.fetchAndPublishMatches(targetDate);
                
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "success", message: "Ingest triggered" }));
            } catch (e) {
                console.error("[API] Ingest Error:", e);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "error", message: String(e) }));
            }
        });
        return;
    }

    // Default Health Check
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end('Backend Active');
  });
  
  server.listen(PORT, () => {
      console.log(`✅ System is active on port ${PORT}. Scheduler running.`);
  });
}

bootstrap().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});

