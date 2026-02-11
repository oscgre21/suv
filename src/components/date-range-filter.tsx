"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface DateRangeFilterProps {
  value: number;
  onChange: (days: number) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={value.toString()} onValueChange={(v) => onChange(parseInt(v))}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Seleccionar período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Últimos 7 días</SelectItem>
          <SelectItem value="30">Últimos 30 días</SelectItem>
          <SelectItem value="90">Últimos 90 días</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
