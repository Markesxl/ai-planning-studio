import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DAY_NAMES = ["D", "S", "T", "Q", "Q", "S", "S"];

interface CalendarProps {
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  taskDates?: string[];
}

export function Calendar({ selectedDate, onSelectDate, taskDates = [] }: CalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (delta: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setViewDate(newDate);
  };

  const isToday = (day: number) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() && 
           month === selectedDate.getMonth() && 
           year === selectedDate.getFullYear();
  };

  const hasTask = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return taskDates.includes(dateStr);
  };

  const handleDayClick = (day: number) => {
    if (onSelectDate) {
      onSelectDate(new Date(year, month, day));
    }
  };

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    currentWeek.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="w-full">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => changeMonth(-1)}
          className="h-8 w-8 rounded-xl text-primary hover:bg-primary/10 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-bold">
          {MONTH_NAMES[month]} {year}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => changeMonth(1)}
          className="h-8 w-8 rounded-xl text-primary hover:bg-primary/10 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Header */}
        {DAY_NAMES.map((day, i) => (
          <div 
            key={i} 
            className="text-center py-2 text-xs text-muted-foreground/70 font-medium"
          >
            {day}
          </div>
        ))}

        {/* Days */}
        {weeks.flat().map((day, index) => (
          <div
            key={index}
            onClick={() => day && handleDayClick(day)}
            className={cn(
              "relative aspect-square flex items-center justify-center text-xs rounded-xl transition-all duration-200",
              day && "cursor-pointer hover:bg-primary/15",
              day && isToday(day) && "bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20",
              day && isSelected(day) && !isToday(day) && "ring-2 ring-primary/50 bg-primary/10 text-primary font-semibold",
              !day && "cursor-default"
            )}
          >
            {day}
            {day && hasTask(day) && (
              <span className={cn(
                "absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                isToday(day) ? "bg-primary-foreground" : "bg-primary"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
