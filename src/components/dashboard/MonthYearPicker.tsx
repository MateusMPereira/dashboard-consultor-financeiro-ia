"use client"

import * as React from "react"
import { format, subMonths, addMonths } from "date-fns"
import { Calendar as CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MonthYearPickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

const months = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export function MonthYearPicker({ date, setDate }: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState(date.getFullYear());

  const handlePreviousMonth = () => {
    setDate(subMonths(date, 1));
  };

  const handleNextMonth = () => {
    setDate(addMonths(date, 1));
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentYear, monthIndex, 1);
    setDate(newDate);
    setOpen(false);
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handlePreviousMonth} className="h-8 w-8 sm:h-9 sm:w-9">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Popover open={open} onOpenchange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[180px] sm:w-[240px] justify-start text-left font-normal"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            <span className="truncate">{format(date, "MMMM yyyy", { locale: ptBR })}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Button variant="ghost" size="sm" onClick={() => setCurrentYear(currentYear - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-bold">{currentYear}</div>
              <Button variant="ghost" size="sm" onClick={() => setCurrentYear(currentYear + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => (
                <Button
                  key={month}
                  variant={
                    date.getMonth() === index && date.getFullYear() === currentYear
                      ? "default"
                      : "ghost"
                  }
                  onClick={() => handleMonthSelect(index)}
                >
                  {month}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8 sm:h-9 sm:w-9">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
