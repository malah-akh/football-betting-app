import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

if (!stripeSecretKey) {
  console.warn("Missing STRIPE_SECRET_KEY. Payment operations will fail.");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-12-18.acacia", // Use latest stable version or lock to what users prefer
  typescript: true,
});
