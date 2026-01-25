import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, TrendingUp, Settings, DollarSign, Activity } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { BottomNav } from "@/app/components/BottomNav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";

interface ChartDataPoint {
  date: string;
  bankroll: number;
}

interface BetHistoryItem {
  id: string;
  created_at: string;
  match_id: string;
  odds: number;
  stake: number;
  status: string | null;
  selection: string;
  profit: number | null;
  match_name: string;
}

export function BankrollScreen() {
  const { user } = useAuth();
  const [startingBankroll, setStartingBankroll] = useState(1000);
  const [tempStartingBankroll, setTempStartingBankroll] = useState("1000");
  const [currency, setCurrency] = useState('EUR');
  const [currentBankroll, setCurrentBankroll] = useState(1000);
  const [totalProfit, setTotalProfit] = useState(0);
  const [roi, setRoi] = useState(0);
  const [yieldVal, setYieldVal] = useState(0);
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [history, setHistory] = useState<BetHistoryItem[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    if (!user) return;
    try {
      // 1. Fetch Profile for settings
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Safe access as types are now aligned with Database definition
        const start = profile.starting_bankroll || 1000;
        setStartingBankroll(start);
        setTempStartingBankroll(start.toString());
        setCurrency(profile.currency || 'EUR');

        // 2. Fetch Picks for calculation
        const { data: picks } = await supabase
          .from('picks')
          .select(`
            *,
            match:matches (
              home_team,
              away_team,
              score,
              status
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }); // Process chronologically for bankroll

        if (picks) {
          let runningBankroll = profile.starting_bankroll || 1000;
          let totalStaked = 0;
          const chartData: ChartDataPoint[] = [];
          const historyData: BetHistoryItem[] = [];

          // Add initial point
          chartData.push({
            date: 'Start',
            bankroll: runningBankroll,
          });

          picks.forEach((pick: any) => {
              const stake = Number(pick.stake) || 0;
              const odds = Number(pick.odds) || 1;
              let profit = 0;

              if (pick.status === 'WON') {
                  profit = (stake * odds) - stake;
              } else if (pick.status === 'LOST') {
                  profit = -stake;
              } else if (pick.status === 'VOID') {
                  profit = 0;
              }

              // Populate Chart (only settled)
              if (pick.status && pick.status !== 'PENDING') {
                  runningBankroll += profit;
                  totalStaked += stake;
                  chartData.push({
                      date: new Date(pick.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                      bankroll: runningBankroll,
                  });
              }

              const match = pick.match; // Generic access since inferred types are tricky here
              // Cast nested JSON fields
              const homeTeam = match?.home_team as { name: string } | undefined;
              const awayTeam = match?.away_team as { name: string } | undefined;

              // Populate History (all)
              historyData.push({
                  id: pick.id,
                  created_at: pick.created_at,
                  match_id: pick.match_id,
                  odds: pick.odds,
                  stake: pick.stake,
                  status: pick.status,
                  selection: pick.selection,
                  profit: pick.status === 'PENDING' ? null : profit,
                  match_name: match ? `${homeTeam?.name || 'Home'} vs ${awayTeam?.name || 'Away'}` : 'Unknown Match'
              });
          });

          setCurrentBankroll(runningBankroll);
          const totalNetProfit = runningBankroll - (profile.starting_bankroll || 1000);
          setTotalProfit(totalNetProfit);
          
          if (totalStaked > 0) {
              setYieldVal((totalNetProfit / totalStaked) * 100);
              const startBank = profile.starting_bankroll || 1000;
              setRoi((totalNetProfit / startBank) * 100); 
          } else {
              setYieldVal(0);
              setRoi(0);
          }

          setData(chartData);
          setHistory(historyData.reverse()); // Show newest first in table
        }
      }
    } catch (error) {
      console.error("Error loading bankroll data:", error);
    }
  }

  async function updateSettings() {
    if (!user) return;
    try {
        const newStart = parseFloat(tempStartingBankroll);
        if (isNaN(newStart)) return;

        const { error } = await supabase
            .from('profiles')
            .update({ starting_bankroll: newStart })
            .eq('id', user.id);

        if (error) throw error;
        
        setStartingBankroll(newStart);
        setIsSettingsOpen(false);
        loadData(); // Reload to recalculate
    } catch (err) {
        console.error("Error updating settings:", err);
    }
  }

  return (
    <div className="bg-[#dae1e9] min-h-screen flex flex-col w-full max-w-7xl mx-auto relative pb-24">
      {/* Header */}
      <div className="bg-[#dae1e9] px-4 pt-6 pb-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
            <Link to="/profile" className="p-2 -ml-2 rounded-full hover:bg-gray-200 transaction-colors text-[#3e4855]">
                <ArrowLeft className="size-6" />
            </Link>
            <h1 className="font-semibold text-[18px] text-[#3e4855]">Bankroll Management</h1>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                    <button className="p-2 -mr-2 rounded-full hover:bg-gray-200 transaction-colors text-[#3e4855]">
                        <Settings className="size-6" />
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bankroll Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="starting-bankroll">Starting Bankroll</Label>
                            <Input 
                                id="starting-bankroll" 
                                type="number" 
                                value={tempStartingBankroll}
                                onChange={(e) => setTempStartingBankroll(e.target.value)}
                            />
                        </div>
                        <Button onClick={updateSettings} className="w-full bg-[#3e4855] text-white hover:bg-[#2d353f]">
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 space-y-4">
        
        {/* Current Balance Card */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-100 p-1.5 rounded-full">
                    <DollarSign className="size-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-[#8b99ac] uppercase tracking-wider">Current Balance</span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#3e4855]">
                    {new Intl.NumberFormat('en-DE', { style: 'currency', currency: currency }).format(currentBankroll)}
                </span>
            </div>
            <div className="mt-4 flex gap-4">
                <div className="flex flex-col">
                    <span className="text-xs text-[#8b99ac]">Total Profit</span>
                    <span className={`text-md font-semibold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {totalProfit >= 0 ? '+' : ''}{new Intl.NumberFormat('en-DE', { style: 'currency', currency: currency }).format(totalProfit)}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-[#8b99ac]">ROI</span>
                    <span className={`text-md font-semibold ${roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                         {roi.toFixed(2)}%
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-[#8b99ac]">Yield</span>
                    <span className={`text-md font-semibold ${yieldVal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {yieldVal.toFixed(2)}%
                    </span>
                </div>
            </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm h-[300px]">
            <h3 className="font-semibold text-[#3e4855] mb-4">Performance History</h3>
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorBankroll" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3e4855" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3e4855" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#8b99ac'}} 
                            minTickGap={30}
                        />
                        <YAxis 
                            hide 
                            domain={['auto', 'auto']}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="bankroll" 
                            stroke="#3e4855" 
                            strokeWidth={2} 
                            fillOpacity={1} 
                            fill="url(#colorBankroll)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[20px] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="size-4 text-[#8b99ac]" />
                    <span className="text-xs text-[#8b99ac] font-medium">Starting Bank</span>
                </div>
                <p className="text-xl font-bold text-[#3e4855]">
                    {new Intl.NumberFormat('en-DE', { style: 'currency', currency: currency }).format(startingBankroll)}
                </p>
            </div>
             <div className="bg-white rounded-[20px] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="size-4 text-[#8b99ac]" />
                    <span className="text-xs text-[#8b99ac] font-medium">Peak Bankroll</span>
                </div>
                <p className="text-xl font-bold text-[#3e4855]">
                    {new Intl.NumberFormat('en-DE', { style: 'currency', currency: currency }).format(Math.max(...data.map(d => d.bankroll), startingBankroll))}
                </p>
            </div>
        </div>

        {/* Bet History Table */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm overflow-hidden">
            <h3 className="font-semibold text-[#3e4855] mb-4">But History</h3>
            <div className="overflow-x-auto -mx-6 px-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Date</TableHead>
                            <TableHead>Match</TableHead>
                            <TableHead>Selection</TableHead>
                            <TableHead className="text-right">Odds</TableHead>
                            <TableHead className="text-right">Stake</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Profit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                    No bets recorded yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            history.map((bet) => (
                                <TableRow key={bet.id}>
                                    <TableCell className="font-medium">
                                        {new Date(bet.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                    </TableCell>
                                    <TableCell className="min-w-[150px]">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-[#3e4855]">{bet.match_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-50">
                                            {bet.selection.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{bet.odds.toFixed(2)}</TableCell>
                                    <TableCell className="text-right text-[#8b99ac]">
                                        {new Intl.NumberFormat('en-DE', { style: 'currency', currency: currency }).format(bet.stake)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge 
                                            className={`${
                                                bet.status === 'WON' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                                                bet.status === 'LOST' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                                bet.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                                'bg-gray-100 text-gray-700 hover:bg-gray-100'
                                            } border-none shadow-none`}
                                        >
                                            {bet.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={`text-right font-bold ${
                                        !bet.profit ? 'text-gray-400' : 
                                        bet.profit > 0 ? 'text-emerald-600' : 
                                        bet.profit < 0 ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                        {bet.profit !== null 
                                            ? (bet.profit > 0 ? '+' : '') + new Intl.NumberFormat('en-DE', { style: 'currency', currency: currency }).format(bet.profit)
                                            : '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 w-full max-w-7xl mx-auto z-50">
        <BottomNav />
      </div>
    </div>
  );
}
