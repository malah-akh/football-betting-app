import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "@/app/components/Header";
import { BottomNav } from "@/app/components/BottomNav";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  User,
  Wallet,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";

export function ProfileScreen() {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const [totalBets, setTotalBets] = useState(0);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  async function fetchStats() {
    if (!user) return;
    try {
      const { count } = await supabase
        .from('picks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      setTotalBets(count || 0);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const menuItems = [
    {
      icon: User,
      label: "Personal Information",
      description: "Update your profile details",
    },
    {
      icon: Wallet,
      label: "Bankroll Management",
      description: "Track your betting bankroll",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Manage your alerts and updates",
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      description: "Control your data and security",
    },
    {
      icon: Settings,
      label: "App Settings",
      description: "Customize your experience",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get assistance when you need it",
    },
  ];

  return (
    <div className="bg-[#dae1e9] min-h-screen flex flex-col max-w-[440px] mx-auto relative pb-24">
      {/* Header */}
      <Header />

      {/* Profile Header */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-[20px] shadow-[0px_13px_36px_0px_rgba(80,82,113,0.2)] p-6">
          <div className="flex items-center gap-4">
            <div className="size-16 bg-[#3e4855] rounded-full flex items-center justify-center">
              <User className="size-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-[18px] text-[#3e4855] tracking-[-0.54px]">
                {profile?.full_name || "User"}
              </h2>
              <p className="text-[12px] text-[#8b99ac] tracking-[-0.24px] mt-1">
                {profile?.email || user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-[20px] shadow-[0px_13px_36px_0px_rgba(80,82,113,0.2)] p-6">
          <h3 className="font-semibold text-[14px] text-[#3e4855] tracking-[-0.28px] mb-4">
            Your Performance
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-[20px] font-semibold text-[#3e4855] tracking-[-0.6px]">
                {totalBets}
              </p>
              <p className="text-[11px] text-[#8b99ac] tracking-[-0.22px] mt-1">
                Total Bets
              </p>
            </div>
            <div className="text-center border-x border-[#f0f2f5]">
              <p className="text-[20px] font-semibold text-[#10b981] tracking-[-0.6px]">
                0%
              </p>
              <p className="text-[11px] text-[#8b99ac] tracking-[-0.22px] mt-1">
                Win Rate
              </p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-semibold text-[#3e4855] tracking-[-0.6px]">
                0
              </p>
              <p className="text-[11px] text-[#8b99ac] tracking-[-0.22px] mt-1">
                Points
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-[20px] shadow-[0px_13px_36px_0px_rgba(80,82,113,0.2)] overflow-hidden">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                index !== menuItems.length - 1 ? "border-b border-[#f0f2f5]" : ""
              }`}
            >
              <div className="bg-[#f0f2f5] p-2 rounded-full text-[#3e4855]">
                <item.icon className="size-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#3e4855] text-[14px]">
                  {item.label}
                </p>
                <p className="text-[11px] text-[#8b99ac] mt-0.5">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="size-4 text-[#8b99ac]" />
            </div>
          ))}
          
          {/* Sign Out Button */}
          <div
            className="p-4 flex items-center gap-4 hover:bg-red-50 transition-colors cursor-pointer border-t border-[#f0f2f5]"
            onClick={handleSignOut}
          >
            <div className="bg-red-100 p-2 rounded-full text-red-600">
              <LogOut className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-600 text-[14px]">
                Sign Out
              </p>
              <p className="text-[11px] text-red-400 mt-0.5">
                Log out of your account
              </p>
            </div>
            <ChevronRight className="size-4 text-red-400" />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[440px] mx-auto">
        <BottomNav />
      </div>
    </div>
  );
}
