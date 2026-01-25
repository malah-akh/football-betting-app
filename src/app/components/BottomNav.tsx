import { Link, useLocation } from "react-router";
import { Rocket } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import svgPaths from "@/imports/svg-hmknk0ergo";

export function BottomNav() {
  const { profile } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isPicks = location.pathname === "/picks";
  const isFavorites = location.pathname === "/favorites";
  const isResults = location.pathname === "/results";
  const isProfile = location.pathname === "/profile";
  const isMissionControl = location.pathname === "/mission-control";

  return (
    <div className="relative bg-[#3e4855] h-[64px]">
      {/* Floating Matches Button */}
      <Link to="/picks" className="absolute -top-6 left-1/2 -translate-x-1/2">
        <div className={`size-[48px] rounded-full flex items-center justify-center transition-colors ${isPicks ? "bg-[#3e4855]" : "bg-[#dae1e9]"}`}>
          <div className="size-[24px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d={svgPaths.p165d8180} fill={isPicks ? "#DAE1E9" : "#3E4855"} />
            </svg>
          </div>
        </div>
      </Link>

      {/* Nav Items */}
      <div className="flex items-center justify-around h-full px-4">
        {/* Home */}
        <Link to="/" className="flex flex-col items-center gap-1">
          <div className="size-[16px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <path d={svgPaths.p3be09100} fill={isHome ? "#DAE1E9" : "#C7CCD2"} />
            </svg>
          </div>
          <p className={`font-semibold text-[14px] tracking-[-0.14px] ${isHome ? "text-white" : "text-[#C7CCD2]"}`}>Home</p>
        </Link>

        {/* Favorites */}
        <Link to="/favorites" className="flex flex-col items-center gap-1">
          <div className="size-[18px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
              <path d={svgPaths.p1143e900} fill={isFavorites ? "#DAE1E9" : "#C7CCD2"} />
            </svg>
          </div>
          <p className={`font-semibold text-[14px] tracking-[-0.14px] ${isFavorites ? "text-white" : "text-[#C7CCD2]"}`}>Favorites</p>
        </Link>

        {/* Matches - Active (empty space due to floating button) */}
        <div className="w-[62px]">
          <p className={`font-semibold text-[14px] tracking-[-0.14px] text-center mt-8 ${isPicks ? "text-white" : "text-[#C7CCD2]"}`}>Matches</p>
        </div>

        {/* Results */}
        <Link to="/results" className="flex flex-col items-center gap-1">
          <div className="size-[18px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
              <path d={svgPaths.p834f840} fill={isResults ? "#DAE1E9" : "#C7CCD2"} />
              <path d={svgPaths.p301ee00} fill={isResults ? "#DAE1E9" : "#C7CCD2"} />
            </svg>
          </div>
          <p className={`font-semibold text-[14px] tracking-[-0.14px] ${isResults ? "text-white" : "text-[#C7CCD2]"}`}>Results</p>
        </Link>

        {/* Profile */}
        <Link to="/profile" className="flex flex-col items-center gap-1">
          <div className="size-[16px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <path d={svgPaths.p39e45000} fill={isProfile ? "#DAE1E9" : "#C7CCD2"} />
            </svg>
          </div>
          <p className={`font-semibold text-[14px] tracking-[-0.14px] ${isProfile ? "text-white" : "text-[#C7CCD2]"}`}>Profile</p>
        </Link>

        {/* Mission Control - Admin Only */}
        {profile?.role === "admin" && (
          <Link to="/mission-control" className="flex flex-col items-center gap-1">
            <div className="size-[16px] flex items-center justify-center">
              <Rocket size={16} color={isMissionControl ? "#DAE1E9" : "#C7CCD2"} />
            </div>
            <p className={`font-semibold text-[14px] tracking-[-0.14px] ${isMissionControl ? "text-white" : "text-[#C7CCD2]"}`}>Admin</p>
          </Link>
        )}
      </div>
    </div>
  );
}