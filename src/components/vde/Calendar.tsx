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

  // Generate calendar grid
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];
  
  // Fill in empty days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    currentWeek.push(null);
  }
  
  // Fill in the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Fill in remaining days
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
          className="text-primary hover:bg-primary/10"
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
          className="text-primary hover:bg-primary/10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Table */}
      <table className="w-full border-collapse text-center text-xs">
        <thead>
          <tr>
            {DAY_NAMES.map((day, i) => (
              <th key={i} className="py-2 text-muted-foreground font-medium">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, dayIndex) => (
                <td
                  key={dayIndex}
                  onClick={() => day && handleDayClick(day)}
                  className={cn(
                    "py-2 relative cursor-pointer rounded-lg transition-all duration-200",
                    day && "hover:bg-primary/20",
                    day && isToday(day) && "bg-primary text-primary-foreground font-black",
                    day && isSelected(day) && !isToday(day) && "border border-primary text-primary",
                    !day && "cursor-default"
                  )}
                >
                  {day}
                  {day && hasTask(day) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
