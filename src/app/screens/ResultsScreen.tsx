import { Header } from "@/app/components/Header";
import { BottomNav } from "@/app/components/BottomNav";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

export function ResultsScreen() {
  const recentResults = [
    {
      id: 1,
      date: "Dec 12, 2024",
      homeTeam: "FC Bayern Munich",
      awayTeam: "Manchester United",
      score: "3-1",
      result: "win",
      amount: "€38.75",
      return: "€58.13",
      profit: "€19.38",
    },
    {
      id: 2,
      date: "Dec 11, 2024",
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      score: "2-2",
      result: "loss",
      amount: "€25.00",
      return: "€0.00",
      profit: "-€25.00",
    },
    {
      id: 3,
      date: "Dec 10, 2024",
      homeTeam: "Liverpool",
      awayTeam: "Arsenal",
      score: "4-0",
      result: "win",
      amount: "€42.50",
      return: "€72.25",
      profit: "€29.75",
    },
  ];

  return (
    <div className="bg-[#dae1e9] min-h-screen flex flex-col max-w-[440px] mx-auto relative">
      {/* Header */}
      <Header />

      {/* Title Section */}
      <div className="px-4 mt-4">
        <h1 className="font-semibold text-[26px] text-[#3e4855] tracking-[-0.78px]">
          Results
        </h1>
        <p className="font-medium text-[14px] text-[#3e4855] tracking-[-0.28px] mt-2">
          Track your betting performance
        </p>
      </div>

      {/* Stats Summary */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-[20px] shadow-[0px_13px_36px_0px_rgba(80,82,113,0.2)] p-6">
          <h2 className="font-semibold text-[16px] text-[#3e4855] tracking-[-0.48px] mb-4">
            This Month
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-[12px] text-[#8b99ac] tracking-[-0.24px] mb-1">
                Total Bets
              </p>
              <p className="font-semibold text-[20px] text-[#3e4855] tracking-[-0.6px]">
                12
              </p>
            </div>
            <div className="text-center">
              <p className="text-[12px] text-[#8b99ac] tracking-[-0.24px] mb-1">
                Win Rate
              </p>
              <p className="font-semibold text-[20px] text-[#4ade80] tracking-[-0.6px]">
                58%
              </p>
            </div>
            <div className="text-center">
              <p className="text-[12px] text-[#8b99ac] tracking-[-0.24px] mb-1">
                Total Profit
              </p>
              <p className="font-semibold text-[20px] text-[#4ade80] tracking-[-0.6px]">
                €124.50
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 px-4 mt-6 space-y-4 pb-24">
        <h3 className="font-semibold text-[14px] text-[#3e4855] tracking-[-0.28px]">
          Recent Results
        </h3>

        {recentResults.map((result) => (
          <div
            key={result.id}
            className="bg-white rounded-[20px] shadow-[0px_13px_36px_0px_rgba(80,82,113,0.2)] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-[#8b99ac]" />
                <p className="text-[11px] text-[#8b99ac] tracking-[-0.22px]">
                  {result.date}
                </p>
              </div>
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  result.result === "win"
                    ? "bg-[#dcfce7] text-[#16a34a]"
                    : "bg-[#fee2e2] text-[#dc2626]"
                }`}
              >
                {result.result === "win" ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                <span className="text-[11px] font-semibold uppercase tracking-[-0.22px]">
                  {result.result}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold text-[#3e4855] tracking-[-0.12px]">
                {result.homeTeam} vs {result.awayTeam}
              </p>
              <p className="text-[14px] font-semibold text-[#3e4855] tracking-[-0.28px]">
                {result.score}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#dae1e9]">
              <div>
                <p className="text-[10px] text-[#8b99ac] tracking-[-0.2px] mb-1">
                  Bet Amount
                </p>
                <p className="text-[12px] font-semibold text-[#3e4855] tracking-[-0.24px]">
                  {result.amount}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#8b99ac] tracking-[-0.2px] mb-1">
                  Return
                </p>
                <p className="text-[12px] font-semibold text-[#3e4855] tracking-[-0.24px]">
                  {result.return}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#8b99ac] tracking-[-0.2px] mb-1">
                  Profit/Loss
                </p>
                <p
                  className={`text-[12px] font-semibold tracking-[-0.24px] ${
                    result.result === "win"
                      ? "text-[#16a34a]"
                      : "text-[#dc2626]"
                  }`}
                >
                  {result.profit}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[440px] mx-auto">
        <BottomNav />
      </div>
    </div>
  );
}
