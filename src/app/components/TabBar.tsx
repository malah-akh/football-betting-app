import { useNavigate, useLocation } from "react-router";
import svgPaths from "@/imports/svg-hmknk0ergo";

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === "/" || location.pathname.startsWith("/match")) {
      return "single";
    } else if (location.pathname === "/multiples") {
      return "multiples";
    } else if (location.pathname === "/combined" || location.pathname === "/combined-details") {
      return "combined";
    }
    return "single";
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: string) => {
    if (tab === "single") {
      navigate("/");
    } else if (tab === "multiples") {
      navigate("/multiples");
    } else if (tab === "combined") {
      navigate("/combined");
    }
  };

  return (
    <div className="px-4 mt-6">
      <div className="flex items-center gap-6 relative">
        {/* Single Tab */}
        <button
          onClick={() => handleTabClick("single")}
          className="flex flex-col items-start gap-4 relative"
        >
          <div className="flex items-center gap-2">
            <div className="size-[18px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                <path d={svgPaths.p2350d00} fill="#3E4855" />
                <path d={svgPaths.p102b4d80} fill="#3E4855" />
              </svg>
            </div>
            <p className="font-bold text-[18px] text-[#3e4855] tracking-[-0.54px]">Single</p>
          </div>
          {activeTab === "single" && (
            <div className="bg-[#3e4855] h-[5px] w-[108px] absolute -bottom-2 left-0" />
          )}
        </button>

        {/* Combined Tab */}
        <button
          onClick={() => handleTabClick("combined")}
          className="flex flex-col items-start gap-4 relative"
        >
          <div className="flex items-center gap-2">
            <div className="size-[19px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
                <path d={svgPaths.p5d21a00} fill="#3E4855" />
                <path d={svgPaths.p3054e680} fill="#3E4855" />
              </svg>
            </div>
            <p className="font-bold text-[18px] text-[#3e4855] tracking-[-0.54px]">Combined</p>
          </div>
          {activeTab === "combined" && (
            <div className="bg-[#3e4855] h-[5px] w-[108px] absolute -bottom-2 left-0" />
          )}
        </button>

        {/* Multiples Tab */}
        <button
          onClick={() => handleTabClick("multiples")}
          className="flex flex-col items-start gap-4 relative"
        >
          <div className="flex items-center gap-2">
            <div className="size-[18px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 18">
                <path d={svgPaths.p2895ef80} fill="#3E4855" />
              </svg>
            </div>
            <p className="font-bold text-[18px] text-[#3e4855] tracking-[-0.54px]">Multiples</p>
          </div>
          {activeTab === "multiples" && (
            <div className="bg-[#3e4855] h-[5px] w-[108px] absolute -bottom-2 left-0" />
          )}
        </button>
      </div>
      
      {/* Divider */}
      <div className="bg-[#bcc2c9] h-px w-full mt-9" />
    </div>
  );
}