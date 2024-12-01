import React, { ReactNode, useRef } from "react";

import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "./select";

const makeExactlyTwoDecimalPlaces = (inputString: string): number => {
  const num = parseFloat(inputString);
  if (isNaN(num)) {
    throw new Error("Invalid input: not a number");
  }

  const decimalPlaces = inputString.includes(".")
    ? inputString.length - inputString.indexOf(".") - 1
    : 0;

  return num * 10 ** (decimalPlaces - 2);
};

const swapCommasAndPeriods = (input: string): string => {
  return input.replace(/[.,]/g, (char) => (char === "," ? "." : ""));
};

export type CurrencyRates = {
  symbol: string;
  value: string;
  factor: number;
  isFavorite: boolean;
}[];

export interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currencyRates: CurrencyRates;
  onCurrencyCodeChange?: (currencyCode: string) => void;
  currencyCode?: string;
  onSubmit?: () => void;
  errorMessage?: ReactNode;
}
export function CurrencyInput({
  value,
  onChange,
  currencyCode = "EUR",
  currencyRates,
  onCurrencyCodeChange,
  onSubmit,
  errorMessage,
}: CurrencyInputProps) {
  const hasError = !!errorMessage;

  const inputRef = useRef<HTMLInputElement>(null);

  const valueStr = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    minimumIntegerDigits: 1,
  }).format(value);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.value === "") {
      onChange(0);

      return;
    }
    const newValue = parseFloat(swapCommasAndPeriods(e.target.value));

    const hasMultipleCommas = (e.target.value.match(/,/g)?.length ?? 0) > 1;

    if (Number.isNaN(newValue)) return;
    if (hasMultipleCommas) return;

    onChange(makeExactlyTwoDecimalPlaces(swapCommasAndPeriods(e.target.value)));
  };

  return (
    <div className="flex flex-col w-[280px]">
      <div style={{ position: "relative" }}>
        <Input
          className={`pr-9 ${
            hasError ? "border-red-500 focus:ring-red-500" : ""
          }`}
          ref={inputRef}
          value={valueStr}
          onChange={handleChange}
          onBlur={onSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit?.();

            const isRangeSelected =
              inputRef.current &&
              inputRef.current.selectionStart == 0 &&
              inputRef.current.selectionEnd === valueStr.length;

            if (
              (e.key === "ArrowLeft" || e.key === "ArrowRight") &&
              !isRangeSelected
            ) {
              e.preventDefault();
            }
            if (e.key === "ArrowLeft" && isRangeSelected)
              setTimeout(
                () =>
                  inputRef.current!.setSelectionRange(
                    valueStr.length,
                    valueStr.length
                  ),
                0
              );
          }}
          onMouseDown={(e) => {
            if (document.activeElement === inputRef.current) e.preventDefault();
            else {
              setTimeout(
                () => inputRef.current!.setSelectionRange(0, valueStr.length),
                0
              );
            }
          }}
          placeholder="0,00"
        />
        <Select value={currencyCode} onValueChange={onCurrencyCodeChange}>
          <SelectTrigger
            unstyled
            className="absolute flex items-center justify-center h-full aspect-square right-0 top-0 cursor-pointer font-bold"
          >
            €
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
      </div>
      {hasError && <p className="text-sm text-red-500 mt-1">{errorMessage}</p>}
    </div>
  );
}
