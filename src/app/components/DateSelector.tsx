import { useState } from "react";
import { format, addDays } from "date-fns";
import { Calendar, SlidersHorizontal } from "lucide-react";

interface DateSelectorProps {
  onDateChange?: (date: Date) => void;
  onFilterClick?: () => void;
}

export function DateSelector({ onDateChange, onFilterClick }: DateSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const today = new Date();

  const dates = [0, 1, 2].map((offset) => {
    const date = addDays(today, offset);
    return {
      label: offset === 0 ? "Today" : format(date, "MM/dd"),
      value: date,
    };
  });

  const handleDateClick = (index: number, date: Date) => {
    setSelectedIndex(index);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 mt-6">
      <div className="flex items-center gap-2">
        <Calendar className="size-5 text-[#3e4855]" />

        <div className="flex items-center gap-3">
          {dates.map((item, index) => {
            const isActive = index === selectedIndex;
            return (
              <button
                key={index}
                onClick={() => handleDateClick(index, item.value)}
                className={
                  isActive
                    ? "bg-[#bcc2c9] rounded-lg px-3 py-1.5 transition-colors"
                    : "border border-[#3e4855] border-solid rounded-lg px-3 py-1.5 hover:bg-black/5 transition-colors"
                }
              >
                <p className="font-bold text-[14px] text-[#3e4855] tracking-[-0.28px]">
                  {item.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <button 
        onClick={onFilterClick}
        className="flex items-center gap-2 text-[#3e4855] hover:opacity-70 transition-opacity"
      >
        <SlidersHorizontal className="size-4" />
        <span className="font-semibold text-[14px] tracking-[-0.28px]">
          Filter
        </span>
      </button>
    </div>
  );
}
