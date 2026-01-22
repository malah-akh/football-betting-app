import { Header } from "@/app/components/Header";
import { BottomNav } from "@/app/components/BottomNav";
import { Heart } from "lucide-react";

export function FavoritesScreen() {
  return (
    <div className="bg-[#dae1e9] min-h-screen flex flex-col max-w-[440px] mx-auto relative">
      {/* Header */}
      <Header />

      {/* Title Section */}
      <div className="px-4 mt-4">
        <h1 className="font-semibold text-[26px] text-[#3e4855] tracking-[-0.78px]">
          Favorites
        </h1>
        <p className="font-medium text-[14px] text-[#3e4855] tracking-[-0.28px] mt-2">
          Your favorite matches and picks
        </p>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <div className="size-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
          <Heart className="size-10 text-[#bcc2c9]" />
        </div>
        <h2 className="font-semibold text-[18px] text-[#3e4855] tracking-[-0.54px] mb-2">
          No Favorites Yet
        </h2>
        <p className="text-[14px] text-[#8b99ac] text-center tracking-[-0.28px] max-w-[280px]">
          Start adding your favorite matches and they will appear here for easy
          access.
        </p>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[440px] mx-auto">
        <BottomNav />
      </div>
    </div>
  );
}