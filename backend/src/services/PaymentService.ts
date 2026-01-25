import { stripe } from "../config/stripe.js";
import { supabaseAdmin } from "../utils/supabaseClient.js";
import Stripe from "stripe";

export class PaymentService {
  /**
   * Creates a Stripe Checkout Session for a subscription.
   */
  static async createCheckoutSession(userId: string, priceId: string, successUrl: string, cancelUrl: string) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get the user's email from Supabase to pre-fill content
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("email, stripe_customer_id")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      throw new Error("User profile not found");
    }

    let customerId = profile.stripe_customer_id;

    // If usage not already registered in Stripe, let Stripe create a new customer during checkout or create one now.
    // For simplicity, we'll pass the customer_email if we don't have an ID, or pass the customer ID if we do.
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId: userId,
      },
    };

    if (customerId) {
        sessionParams.customer = customerId;
    } else {
        sessionParams.customer_email = profile.email;
        // NOTE: 'customer_creation' is invalid in subscription mode because Stripe handles it automatically if not provided.
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return { url: session.url };
  }

  /**
   * Creates a Billing Portal Session for the user to manage subscription.
   */
  static async createPortalSession(userId: string, returnUrl: string) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('stripe_customer_id').eq('id', userId).single();
      
      if (!profile || !profile.stripe_customer_id) {
          throw new Error("No Stripe Customer ID found for this user.");
      }

      const session = await stripe.billingPortal.sessions.create({
          customer: profile.stripe_customer_id,
          return_url: returnUrl,
      });

      return { url: session.url };
  }

  /**
   * Handles Stripe Webhooks to update local database state.
   */
  static async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId) {
            await this.updateSubscriptionStatus(userId, customerId, subscriptionId, 'active');
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const customerId = subscription.customer as string;
        
        // Find user by stripe_customer_id
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();
            
        if (profile) {
             await this.updateSubscriptionStatus(profile.id, customerId, subscription.id, status, (subscription as any).current_period_end);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  /**
   * Manually syncs a user's subscription status from Stripe
   */
  static async syncSubscription(userId: string) {
      // 1. Get user email
      const { data: profile } = await supabaseAdmin.from('profiles').select('email, stripe_customer_id').eq('id', userId).single();
      if (!profile) throw new Error("User not found");

      let customerId = profile.stripe_customer_id;

      // 2. If no customer ID, search by email
      if (!customerId) {
          const customers = await stripe.customers.list({ email: profile.email, limit: 1 });
          if (customers.data.length > 0) {
              customerId = customers.data[0].id;
          }
      }

      if (!customerId) {
          throw new Error("No Stripe customer found for this email.");
      }

      // 3. Find active subscriptions
      const subscriptions = await stripe.subscriptions.list({ 
          customer: customerId,
          status: 'all',
          limit: 1 
      });

      if (subscriptions.data.length === 0) {
          // No subscription found, make sure DB reflects this (unless they are admin?)
          // For now, just return
          return { status: 'no_subscription' };
      }

      const sub = subscriptions.data[0] as Stripe.Subscription;
      await this.updateSubscriptionStatus(userId, customerId, sub.id, sub.status, (sub as any).current_period_end);
      
      return { 
          status: sub.status, 
          current_period_end: (sub as any).current_period_end 
      };
  }

  private static async updateSubscriptionStatus(userId: string, customerId: string, subscriptionId: string, status: string, periodEnd?: number) {
     const updates: any = {
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: status,
        is_premium: status === 'active' || status === 'trialing'
     };

     if (periodEnd) {
         updates.current_period_end = new Date(periodEnd * 1000).toISOString();
     }

     const { error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId);

     if (error) {
         console.error('[PaymentService] Failed to update profile:', error);
     } else {
         console.log(`[PaymentService] Updated subscription for user ${userId} to ${status}`);
     }
  }
}
