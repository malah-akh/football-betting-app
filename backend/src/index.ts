import { startScheduler } from "./scheduler/index.js";
import { matchProcessor } from "./consumers/matchProcessor.js";
import { connectRedpanda } from "./config/redpanda.js";
import dotenv from "dotenv";
import http from "http";
import { PaymentService } from "./services/PaymentService.js";
import { stripe } from "./config/stripe.js";

dotenv.config();

const PORT = 5050;

import { MatchIngestionProducer } from "./producers/matchIngestion.js";

async function bootstrap() {
  console.log('🚀 Starting Backend Service (Event-Driven)... WITH PAYMENTS SUPPORT');
  
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
    console.log(`[HTTP] ${req.method} ${req.url}`);

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, stripe-signature");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = req.url || "";

    // WEBHOOK: Must handle raw body for signature verification
    if (url.startsWith("/api/webhook") && req.method === "POST") {
        const chunks: Buffer[] = [];
        req.on("data", chunk => chunks.push(chunk));
        req.on("end", async () => {
            const rawBody = Buffer.concat(chunks);
            const signature = req.headers["stripe-signature"];

            if (!signature) {
                 res.writeHead(400);
                 res.end("Missing stripe-signature header");
                 return;
            }
            
            try {
                const event = stripe.webhooks.constructEvent(
                    rawBody,
                    signature as string,
                    process.env.STRIPE_WEBHOOK_SECRET || ""
                );
                await PaymentService.handleWebhook(event);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ received: true }));
            } catch (err: any) {
                console.error(`Webhook Error: ${err.message}`);
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end(`Webhook Error: ${err.message}`);
            }
        });
        return;
    }

    // CHECKOUT API
    if (url.startsWith("/api/checkout") && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", async () => {
             try {
                 const { priceId, successUrl, cancelUrl, userId } = JSON.parse(body);
                 const result = await PaymentService.createCheckoutSession(userId, priceId, successUrl, cancelUrl);
                 res.writeHead(200, { "Content-Type": "application/json" });
                 res.end(JSON.stringify(result));
             } catch(e: any) {
                 console.error("[API] Checkout Error:", e);
                 res.writeHead(500, { "Content-Type": "application/json" });
                 res.end(JSON.stringify({ error: e.message }));
             }
        });
        return;
    }

    // CUSTOMER PORTAL API
    if (url.startsWith("/api/portal") && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", async () => {
             try {
                 const { userId, returnUrl } = JSON.parse(body);
                 const result = await PaymentService.createPortalSession(userId, returnUrl);
                 res.writeHead(200, { "Content-Type": "application/json" });
                 res.end(JSON.stringify(result));
             } catch(e: any) {
                 console.error("[API] Portal Error:", e);
                 res.writeHead(500, { "Content-Type": "application/json" });
                 res.end(JSON.stringify({ error: e.message }));
             }
        });
        return;
    }

    // SYNC SUBSCRIPTION API
    if (url.startsWith("/api/sync-subscription") && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", async () => {
             try {
                 const { userId } = JSON.parse(body);
                 const result = await PaymentService.syncSubscription(userId);
                 res.writeHead(200, { "Content-Type": "application/json" });
                 res.end(JSON.stringify(result));
             } catch(e: any) {
                 console.error("[API] Sync Error:", e);
                 res.writeHead(500, { "Content-Type": "application/json" });
                 res.end(JSON.stringify({ error: e.message }));
             }
        });
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

