import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

// Replace with your actual Stripe Price ID (e.g., prod_... on live, price_... on test)
const STRIPE_PRICE_ID = "price_1StXZVPlsSmDwanRKFc3JICh"; // 10 EUR/Month

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Direct call to backend
      const response = await fetch("http://localhost:5050/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           userId: user.id,
           priceId: STRIPE_PRICE_ID, // Ensure this exists in your Stripe Dashboard
           successUrl: window.location.origin + "/profile?success=true",
           cancelUrl: window.location.origin + "/profile?canceled=true",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to start subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Unlimited Premium Picks",
    "Advanced Stats & Analytics",
    "Priority Support",
    "Ad-free Experience",
    "Exclusive Value Bet Alerts"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-[#3e4855]">Upgrade to Premium</DialogTitle>
          <DialogDescription className="text-center text-[#8b99ac] pt-2">
            Unlock the full potential of your betting strategy with our data-driven picks.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex justify-center mb-6">
             <span className="text-4xl font-bold text-[#3e4855]">10€</span>
             <span className="text-[#8b99ac] self-end mb-1 ml-1">/ month</span>
          </div>

          <div className="space-y-3 px-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                 <div className="bg-green-100 p-1 rounded-full">
                    <Check className="size-4 text-green-600" />
                 </div>
                 <span className="text-[#3e4855] text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
            <button 
                onClick={handleSubscribe} 
                disabled={loading}
                className="w-full bg-[#3e4855] hover:bg-[#2d3540] text-white h-12 rounded-xl text-lg font-semibold flex items-center justify-center transition-opacity disabled:opacity-70"
            >
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Subscribe Now"}
            </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
