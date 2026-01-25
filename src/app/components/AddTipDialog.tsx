import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/app/components/ui/select";
import { Slider } from "@/app/components/ui/slider";

interface AddTipDialogProps {
  match: any;
  existingTip?: any;
  onSave: () => void;
}

export function AddTipDialog({ match, existingTip, onSave }: AddTipDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [selection, setSelection] = useState(existingTip?.selection || "");
  const [odds, setOdds] = useState(existingTip?.odds || "");
  const [analysis, setAnalysis] = useState(existingTip?.analysis || "");
  const [isPremium, setIsPremium] = useState(existingTip ? existingTip.is_premium : true);
  
  // New fields
  const [market, setMarket] = useState(existingTip?.market || "Match Winner");
  const [line, setLine] = useState(existingTip?.line || "");
  const [side, setSide] = useState(existingTip?.side || "");
  
  const [stake, setStake] = useState([existingTip?.stake || 1]);
  const [confidence, setConfidence] = useState([existingTip?.confidence || 75]);
  const [bookmaker, setBookmaker] = useState(existingTip?.bookmaker || "");
  const [realProbability, setRealProbability] = useState(
    existingTip?.real_probability ? (existingTip.real_probability * 100).toString() : ""
  );
  const [keyFactors, setKeyFactors] = useState(
    existingTip?.content?.keyFactors?.join("\n") || ""
  );

  // Derived Value Calculation
  const parsedOdds = parseFloat(odds);
  const parsedProb = parseFloat(realProbability); // Your Prob %
  const parsedLine = parseFloat(line);
  
  // 5. Implied probability (derived)
  const impliedProb = !isNaN(parsedOdds) && parsedOdds > 1 ? (1 / parsedOdds) : 0;
  const impliedProbPercent = impliedProb * 100;
  
  // 6. Edge calculation (must exist)
  // Edge = Your Probability - Implied Probability
  const edgeRaw = !isNaN(parsedProb) && impliedProb > 0 
    ? (parsedProb / 100) - impliedProb 
    : -1;
    
  const edgePercent = edgeRaw * 100;
  
  // Rule: Edge <= 0 -> no tip
  const isPositiveEV = edgeRaw > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isNaN(parsedOdds)) {
        alert("Please enter valid numeric odds");
        setLoading(false);
        return;
      }
      
      if (!isPositiveEV) {
        alert("Strict Rule: Edge must be positive (> 0%). No negative EV tips allowed.");
        setLoading(false);
        return;
      }
      
      const tipData = {
        match_id: match.id,
        selection,
        odds: parsedOdds,
        analysis,
        is_premium: isPremium,
        status: existingTip?.status || 'PENDING',
        market,
        line: !isNaN(parsedLine) ? parsedLine : null,
        side: side || null,
        stake: stake[0],
        confidence: confidence[0],
        bookmaker,
        real_probability: parsedProb ? parsedProb / 100 : null,
        implied_probability: impliedProb > 0 ? impliedProb : null,
        value_edge: edgeRaw, // Storing decimal edge
        content: {
          ...existingTip?.content,
          keyFactors: keyFactors.split("\n").filter((f: string) => f.trim() !== ""),
        }
      };

      if (existingTip?.id) {
        // Update
        // @ts-ignore: Manually added table type inference issue
        const { error } = await supabase
          .from("tips")
          .update(tipData)
          .eq("id", existingTip.id);
        if (error) throw error;
      } else {
        // Insert
        // @ts-ignore: Manually added table type inference issue
        const { error } = await supabase
          .from("tips")
          .insert(tipData);
        if (error) throw error;
      }

      setOpen(false);
      onSave();
    } catch (error) {
      console.error("Error saving tip:", error);
      alert("Failed to save tip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={existingTip ? "outline" : "default"} size="sm">
          {existingTip ? "Edit Tip" : "Add Tip"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingTip ? "Edit Tip" : "Add Tip"}</DialogTitle>
          <DialogDescription>
            {existingTip 
              ? "Update the details of your prediction. Ensure reasoning is sound." 
              : " create a new prediction based on value and probability."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="market" className="text-right">
              Market
            </Label>
            <Select value={market} onValueChange={setMarket}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectGroup>
                  <SelectLabel>Main Markets</SelectLabel>
                  <SelectItem value="Match Winner">Match Winner (1X2)</SelectItem>
                  <SelectItem value="Double Chance">Double Chance</SelectItem>
                  <SelectItem value="Correct Score">Correct Score</SelectItem>
                  <SelectItem value="HT/FT">Half Time / Full Time</SelectItem>
                  <SelectItem value="Draw No Bet">Draw No Bet (DNB)</SelectItem>
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Goals</SelectLabel>
                  <SelectItem value="Over 1.5 Goals">Over 1.5 Goals</SelectItem>
                  <SelectItem value="Over 2.5 Goals">Over 2.5 Goals</SelectItem>
                  <SelectItem value="Under 2.5 Goals">Under 2.5 Goals</SelectItem>
                  <SelectItem value="Over 3.5 Goals">Over 3.5 Goals</SelectItem>
                  <SelectItem value="BTTS">Both Teams to Score (BTTS)</SelectItem>
                  <SelectItem value="Clean Sheet">Clean Sheet</SelectItem>
                  <SelectItem value="Win to Nil">Win to Nil</SelectItem>
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Handicaps</SelectLabel>
                  <SelectItem value="Asian Handicap">Asian Handicap</SelectItem>
                  <SelectItem value="European Handicap">European Handicap</SelectItem>
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Player Props</SelectLabel>
                  <SelectItem value="Anytime Goalscorer">Anytime Goalscorer</SelectItem>
                  <SelectItem value="First Goalscorer">First Goalscorer</SelectItem>
                  <SelectItem value="Player Cards">Player Cards</SelectItem>
                  <SelectItem value="Player Shots">Player Shots</SelectItem>
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Stats</SelectLabel>
                  <SelectItem value="Total Corners">Corners (Over/Under)</SelectItem>
                  <SelectItem value="Total Cards">Yellow Cards (Over/Under)</SelectItem>
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Other</SelectLabel>
                  <SelectItem value="To Qualify">To Qualify</SelectItem>
                  <SelectItem value="Outright Winner">Outright Winner</SelectItem>
                  <SelectItem value="Acca / Combo">Acca / Combo</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Structured Market Inputs */}
          {(market.includes("Over") || market.includes("Under") || market.includes("Handicap") || market.includes("Goals")) && (
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="line" className="text-right">Line</Label>
              <Input
                id="line"
                type="number" 
                step="0.25"
                value={line}
                onChange={(e) => setLine(e.target.value)}
                placeholder="2.5, -1.0..."
                className="col-span-3"
              />
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="side" className="text-right">Selection</Label>
             <div className="col-span-3 flex gap-2">
                <Input
                  id="side"
                  value={side}
                  onChange={(e) => setSide(e.target.value)}
                  placeholder="Side (Over, Home...)"
                  className="w-1/3"
                />
                <Input
                  id="selection"
                  value={selection}
                  onChange={(e) => setSelection(e.target.value)}
                  placeholder="Full Selection Name (required)"
                  className="w-2/3"
                  required
                />
             </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="odds" className="text-right">
              Odds @ Release
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="odds"
                type="number"
                step="0.01"
                value={odds}
                onChange={(e) => setOdds(e.target.value)}
                placeholder="2.00"
                required
                className="flex-1"
              />
               <div className="flex items-center justify-center px-3 bg-muted rounded text-xs text-muted-foreground whitespace-nowrap min-w-[80px]">
                  Implied: {impliedProbPercent.toFixed(1)}%
               </div>
            </div>
          </div>
          
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bookmaker" className="text-right">Bookmaker</Label>
             <Input
                id="bookmaker"
                value={bookmaker}
                onChange={(e) => setBookmaker(e.target.value)}
                placeholder="e.g. Bet365"
                className="col-span-3"
              />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="realProbability" className="text-right font-bold text-primary">
              My Probability
            </Label>
            <div className="col-span-3 flex items-center gap-2">
               <div className="relative flex-1">
                <Input
                  id="realProbability"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={realProbability}
                  onChange={(e) => setRealProbability(e.target.value)}
                  placeholder="55"
                  className="pr-8 font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
               </div>
               
               <div className={`flex flex-col justify-center items-center text-xs h-9 px-3 rounded border w-36 ${
                    isPositiveEV 
                      ? 'bg-green-100 border-green-300 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                   <span className="font-bold">
                     EDGE: {edgeRaw > 0 ? '+' : ''}{edgePercent.toFixed(1)}%
                   </span>
                 </div>
            </div>
          </div>
          
          {!isPositiveEV && edgePercent > -100 && (
             <div className="col-span-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm text-center">
                ⛔️ <strong>No Edge Detected.</strong> Tip cannot be saved.<br/>
                Your probability must be higher than {(impliedProbPercent).toFixed(1)}%.
             </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Stake ({stake})</Label>
            <Slider
              value={stake}
              onValueChange={setStake}
              min={1}
              max={10}
              step={1}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Conf ({confidence}%)</Label>
            <Slider
              value={confidence}
              onValueChange={setConfidence}
              min={0}
              max={100}
              step={5}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="analysis" className="text-right">
              Summary
            </Label>
            <Textarea
              id="analysis"
              value={analysis}
              onChange={(e) => setAnalysis(e.target.value)}
              placeholder="Summary hook..."
              className="col-span-3 h-20"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="keyFactors" className="text-right">
              Key Factors
            </Label>
            <Textarea
              id="keyFactors"
              value={keyFactors}
              onChange={(e) => setKeyFactors(e.target.value)}
              placeholder="One factor per line..."
              className="col-span-3 h-20"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="premium" className="text-right">
              Premium
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                id="premium"
                checked={isPremium}
                onCheckedChange={setIsPremium}
              />
              <Label htmlFor="premium">{isPremium ? "Yes (Premium Only)" : "No (Free for all)"}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !isPositiveEV}>
              {loading ? "Saving..." : "Save Tip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
