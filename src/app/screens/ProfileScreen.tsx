import { Header } from "@/app/components/Header";
import { BottomNav } from "@/app/components/BottomNav";
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
    <div className="bg-[#dae1e9] min-h-screen flex flex-col max-w-[440px] mx-auto relative">
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
                John Doe
              </h2>
              <p className="text-[12px] text-[#8b99ac] tracking-[-0.24px] mt-1">
                john.doe@example.com
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
                47
              </p>
              <p className="text-[11px] text-[#8b99ac] tracking-[-0.22px] mt-1">
                Total Bets
              </p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-semibold text-[#4ade80] tracking-[-0.6px]">
                62%
              </p>
              <p className="text-[11px] text-[#8b99ac] tracking-[-0.22px] mt-1">
                Win Rate
              </p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-semibold text-[#4ade80] tracking-[-0.6px]">
                €487
              </p>
              <p className="text-[11px] text-[#8b99ac] tracking-[-0.22px] mt-1">
                Total Profit
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-4 mt-6 space-y-3 pb-24">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className="w-full bg-white rounded-[16px] shadow-[0px_4px_12px_0px_rgba(80,82,113,0.1)] p-4 flex items-center gap-4 hover:shadow-[0px_8px_16px_0px_rgba(80,82,113,0.15)] transition-shadow"
            >
              <div className="size-10 bg-[#f1f3f5] rounded-full flex items-center justify-center flex-shrink-0">
                <Icon className="size-5 text-[#3e4855]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-[14px] text-[#3e4855] tracking-[-0.28px]">
                  {item.label}
                </p>
                <p className="text-[11px] text-[#8b99ac] tracking-[-0.22px] mt-0.5">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="size-5 text-[#bcc2c9] flex-shrink-0" />
            </button>
          );
        })}

        {/* Logout Button */}
        <button className="w-full bg-white rounded-[16px] shadow-[0px_4px_12px_0px_rgba(80,82,113,0.1)] p-4 flex items-center gap-4 hover:shadow-[0px_8px_16px_0px_rgba(80,82,113,0.15)] transition-shadow border-2 border-[#fee2e2]">
          <div className="size-10 bg-[#fee2e2] rounded-full flex items-center justify-center flex-shrink-0">
            <LogOut className="size-5 text-[#dc2626]" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-[14px] text-[#dc2626] tracking-[-0.28px]">
              Log Out
            </p>
            <p className="text-[11px] text-[#8b99ac] tracking-[-0.22px] mt-0.5">
              Sign out of your account
            </p>
          </div>
          <ChevronRight className="size-5 text-[#dc2626] flex-shrink-0" />
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[440px] mx-auto">
        <BottomNav />
      </div>
    </div>
  );
}