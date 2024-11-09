"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function DatePicker({
  date,
  onChange,
  defaultMonth = new Date(),
  hasClearButton = true,
}: {
  defaultMonth?: Date;
  date: Date;
  onChange: (date?: Date) => void;
  hasClearButton?: boolean;
}) {
  return (
    <Popover>
      <div className="relative w-fit">
        {date != null && hasClearButton && (
          <Button
            className="absolute text-gray-400 hover:text-gray-700 right-0"
            variant="link"
            onClick={() => onChange(undefined)}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "MMM d yyyy") : <span>None</span>}
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          initialFocus
          defaultMonth={defaultMonth}
        />
      </PopoverContent>
    </Popover>
  );
}
