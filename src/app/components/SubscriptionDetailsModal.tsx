import { X, Calendar, CreditCard, CheckCircle, Shield, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";

interface SubscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionDetailsModal({ isOpen, onClose }: SubscriptionDetailsModalProps) {
  const { profile, user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSync = async () => {
      if (!user) return;
      setSyncing(true);
      try {
          const res = await fetch("http://localhost:5050/api/sync-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: user.id })
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);

          await refreshProfile();
          alert("Subscription status synced!");
      } catch (err: any) {
          console.error("Sync failed:", err);
          alert(err.message || "Sync failed");
      } finally {
          setSyncing(false);
      }
  };

  const handleManageBilling = async () => {
      if (!user) return;
      setLoading(true);
      try {
          const res = await fetch("http://localhost:5050/api/portal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  userId: user.id,
                  returnUrl: window.location.href
              })
          });
          const data = await res.json();
          if (data.url) window.location.href = data.url;
          else throw new Error(data.error || "No portal URL returned");
      } catch (err) {
          console.error("Failed to open portal:", err);
          alert("Could not open billing portal.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-[400px] p-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b99ac] hover:text-[#3e4855] transition-colors"
        >
          <X className="size-6" />
        </button>

        {/* Header Icon */}
        <div className="flex justify-center mb-4">
          <div className="size-16 bg-[#e0f2fe] rounded-full flex items-center justify-center">
            <Shield className="size-8 text-[#0ea5e9]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center font-bold text-[24px] text-[#3e4855] tracking-[-0.72px] mb-1">
          Subscription Details
        </h2>
        <p className="text-center text-[13px] text-[#8b99ac] tracking-[-0.26px] mb-6">
          Manage your plan and billing information
        </p>

        {/* Status Card */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] p-4 mb-4 relative">
          <button 
             onClick={handleSync}
             disabled={syncing}
             className="absolute top-4 right-4 text-[#64748b] hover:text-[#3e4855] p-1 rounded-full hover:bg-white transition-all border border-transparent hover:border-gray-200"
             title="Sync Status"
          >
             <RefreshCw className={`size-4 ${syncing ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-[#64748b] font-medium">Status</span>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                profile?.subscription_status === 'active' 
                ? 'bg-[#dcfce7] border-[#bbf7d0]' 
                : 'bg-gray-100 border-gray-200'
            }`}>
              <div className={`size-2 rounded-full ${
                  profile?.subscription_status === 'active' 
                  ? 'bg-[#16a34a] animate-pulse' 
                  : 'bg-gray-400'
              }`} />
              <span className={`text-[11px] font-bold uppercase tracking-wide ${
                  profile?.subscription_status === 'active' 
                  ? 'text-[#166534]' 
                  : 'text-gray-600'
              }`}>
                {profile?.subscription_status || "Inactive"}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
               <div className="bg-white p-2 rounded-lg border border-[#e2e8f0] text-[#64748b]">
                  <CreditCard className="size-4" />
               </div>
               <div>
                  <p className="text-[12px] text-[#64748b]">Current Plan</p>
                  <p className="text-[14px] text-[#0f172a] font-semibold">Premium Member</p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <div className="bg-white p-2 rounded-lg border border-[#e2e8f0] text-[#64748b]">
                  <Calendar className="size-4" />
               </div>
               <div>
                  <p className="text-[12px] text-[#64748b]">Period Ends</p>
                  <p className="text-[14px] text-[#0f172a] font-semibold">
                    {profile?.current_period_end 
                      ? format(new Date(profile.current_period_end), "MMMM d, yyyy")
                      : "N/A"}
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Features List (Reminders of what they have) */}
        <div className="space-y-2 mb-6">
           <h4 className="text-[12px] font-semibold text-[#64748b] uppercase tracking-wider mb-2">Included Features</h4>
           {["Unlimited Access to Picks", "Bankroll Management Tools", "Ad-Free Experience"].map((feat, i) => (
             <div key={i} className="flex items-center gap-2">
                <CheckCircle className="size-4 text-[#10b981]" />
                <span className="text-[13px] text-[#334155]">{feat}</span>
             </div>
           ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
            <button
            onClick={handleManageBilling}
            disabled={loading}
            className="w-full bg-[#3e4855] text-white hover:bg-[#2d3540] py-3.5 rounded-[12px] font-semibold text-[14px] transition-colors flex justify-center items-center gap-2"
            >
            {loading ? <Loader2 className="animate-spin size-4"/> : <ExternalLink className="size-4" />}
            Manage Billing on Stripe
            </button>
            
            <button
            onClick={onClose}
            className="w-full bg-white border border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc] py-3.5 rounded-[12px] font-semibold text-[14px] transition-colors"
            >
            Close
            </button>
        </div>
      </div>
    </div>
  );
}
