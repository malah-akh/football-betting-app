import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMatchTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "--:--";

  const date = new Date(dateStr);
  
  if (isNaN(date.getTime())) {
    return "--:--";
  }
  
  // Use system locale to ensure time is displayed in the user's local timezone
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

