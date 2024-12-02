import React, { ReactNode } from "react";

import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "./select";
import { cn } from "@/lib/utils";
import { useCurrencyInput } from "../useCurrencyInput";
import { useFullInputSelection } from "../useFullInputSelection";

export type CurrencyRates = {
  symbol: string;
  value: string;
  factor: number;
  isFavorite: boolean;
}[];

export interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currencyRates?: CurrencyRates;
  onCurrencyCodeChange?: (currencyCode: string) => void;
  currencyCode?: string;
  onSubmit?: () => void;
  errorMessage?: ReactNode;
  hasCurrencyPicker?: boolean;

  className?: string;
}

export function CurrencyInput({
  value,
  onChange,
  currencyCode = "EUR",
  currencyRates = [],
  onCurrencyCodeChange,
  onSubmit,
  errorMessage,
  hasCurrencyPicker = true,
  className,
}: CurrencyInputProps) {
  const hasError = !!errorMessage;

  return (
    <div className={cn("flex flex-col w-[280px]", className)}>
      <div style={{ position: "relative" }}>
        <Input
          className={cn(
            "pr-9",
            hasError && "border-red-500 focus:ring-red-500"
          )}
          {...useCurrencyInput(value, onChange)}
          {...useFullInputSelection(onSubmit)}
        />
        {hasCurrencyPicker ? (
          <Select value={currencyCode} onValueChange={onCurrencyCodeChange}>
            <SelectTrigger
              unstyled
              className="absolute flex items-center justify-center h-full aspect-square right-0 top-0 cursor-pointer font-bold p-1 group"
            >
              <div className="h-full aspect-square flex items-center justify-center rounded-sm group-hover:bg-gray-100">
                €
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {currencyRates
                  .filter((i) => i.isFavorite)
                  .map((i) => (
                    <SelectItem key={i.value} value={i.value}>
                      {i.symbol} ({i.value})
                    </SelectItem>
                  ))}
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                {currencyRates
                  .filter((i) => !i.isFavorite)
                  .map((i) => (
                    <SelectItem key={i.value} value={i.value}>
                      {i.symbol} ({i.value})
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <div className="absolute flex items-center justify-center h-full aspect-square right-0 top-0 cursor-pointer font-bold">
            €
          </div>
        )}
      </div>
      {hasError && <p className="text-sm text-red-500 mt-1">{errorMessage}</p>}
    </div>
  );
}
