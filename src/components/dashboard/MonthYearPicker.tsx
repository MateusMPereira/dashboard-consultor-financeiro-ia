"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
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

const MONTHS = Array.from({ length: 12 }).map((_, i) =>
  format(new Date(2000, i, 1), "MMMM", { locale: ptBR })
);

export function MonthYearPicker({ date, setDate }: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false);
  const initialYear = date ? date.getFullYear() : new Date().getFullYear();
  const [year, setYear] = React.useState<number>(initialYear);

  React.useEffect(() => {
    // keep year in sync when external date changes
    if (date) setYear(date.getFullYear());
  }, [date]);

  const onSelectMonth = (monthIndex: number) => {
    const newDate = new Date(year, monthIndex, 1);
    setDate(newDate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMMM yyyy", { locale: ptBR }) : <span>Selecione o mês</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">{year}</div>
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((monthName, idx) => {
            const isSelected = date && date.getFullYear() === year && date.getMonth() === idx;
            return (
              <Button
                key={monthName}
                variant={isSelected ? "default" : "ghost"}
                className="w-full text-left"
                onClick={() => onSelectMonth(idx)}
              >
                {monthName}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
