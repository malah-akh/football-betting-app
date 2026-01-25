import { stripe } from "../config/stripe.js";
import dotenv from "dotenv";

dotenv.config();

async function testStripeConnection() {
  console.log("Checking Stripe configuration...");
  
  if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY is missing in backend/.env");
      process.exit(1);
  }

  try {
    const list = await stripe.products.list({ limit: 1 });
    console.log("✅ Stripe Connection Successful!");
    console.log(`   Fetched ${list.data.length} product(s) as a test.`);
  } catch (error: any) {
    console.error("❌ Stripe Connection Failed:");
    console.error(`   ${error.message}`);
  }
}

testStripeConnection();
