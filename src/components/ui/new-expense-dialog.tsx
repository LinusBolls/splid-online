import { ViewCategory } from "@/ViewEntry";
import { Button } from "./button";
import { CurrencyInput, CurrencyRates } from "./currency-input";
import { DatePicker } from "./date-picker";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import ExpenseCategorySelect from "./expense-category-select";
import ExpensePayerSelect from "./expense-payer-select";
import { Input } from "./input";
import { Label } from "./label";
import { useState } from "react";
import { ScrollArea } from "./scroll-area";
import { Checkbox } from "./checkbox";
import { ProfiteerInput } from "./entry-profiteers";
import { cn } from "@/lib/utils";
import { MAX_EXPENSE_AMOUNT_EUR } from "@/constants";
import { useProfiteers } from "../useProfiteers";

export interface CreateExpenseInput {
  title: string;
  category?: ViewCategory;
  by: string;
  amount: number;
  currencyCode: string;
  date?: Date;
  for: Record<string, number>;
}
export interface NewExpenseDialogProps {
  currencyRates: CurrencyRates;
  categories: ViewCategory[];
  members: { value: string; name: string }[];
  defaultCurrencyCode: string;
  onClose: () => void;
  onSubmit: (expense: CreateExpenseInput) => void;
}
export default function NewExpenseDialog({
  currencyRates,
  categories,
  members,
  defaultCurrencyCode,
  onClose,
  onSubmit,
}: NewExpenseDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ViewCategory | undefined>(undefined);
  const [by, setBy] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState<number>(0);
  const [currencyCode, setCurrencyCode] = useState<string>(defaultCurrencyCode);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showValidation, setShowValidation] = useState(false);

  const {
    profiteers,
    removeProfiteer,
    addProfiteer,
    setProfiteerPercentage,
    setProfiteerAmount,
  } = useProfiteers(amount);

  const actualProfiteers = profiteers.length
    ? profiteers
    : members.map((i) => ({ id: i.value, share: 1 / members.length }));

  const handleSubmit = async () => {
    if (title && by && amount > 0) {
      setIsSubmitting(true);

      try {
        const forRecord = actualProfiteers.reduce(
          (acc, i) => ({ ...acc, [i.id]: i.share }),
          {}
        );

        await onSubmit({
          title,
          category,
          by,
          amount,
          currencyCode,
          date,
          for: forRecord,
        });
        onClose();
      } catch (err) {
        alert(err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setShowValidation(true);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]" onClose={onClose}>
      <DialogHeader>
        <DialogTitle>New expense</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">
            Title
          </Label>
          <Input
            value={title}
            className="col-span-3"
            placeholder="Title*"
            onFocus={(e) => e.target.select()}
            onChange={(e) => setTitle(e.target.value)}
            required
            errorMessage={showValidation && title.length < 1 && "Required"}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Amount
          </Label>
          <CurrencyInput
            errorMessage={showValidation && amount <= 0 && "Can't be zero"}
            value={amount}
            onChange={(value) => {
              if (value <= MAX_EXPENSE_AMOUNT_EUR) setAmount(value);
            }}
            onSubmit={() => {}}
            currencyRates={currencyRates}
            currencyCode={currencyCode}
            onCurrencyCodeChange={setCurrencyCode}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Category
          </Label>
          <ExpenseCategorySelect
            categories={categories}
            value={category?.value}
            onValueChange={setCategory}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">
            Date
          </Label>
          <DatePicker date={date} onChange={setDate} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="payer" className="text-right">
            By
          </Label>
          <ExpensePayerSelect
            members={members}
            value={by}
            onValueChange={setBy}
            errorMessage={showValidation && title.length < 1 && "Required"}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="for" className="text-right">
            For
          </Label>
          <ScrollArea className="h-60 w-[280px] rounded-md border">
            <div className="p-4">
              {members.map((i, idx) => {
                const profiteer = actualProfiteers.find(
                  (j) => j.id === i.value
                );

                const profits = profiteer != null;

                const hasSeperator = idx < members.length - 1;

                const isChecked = profiteers.some((j) => j.id === i.value);

                return (
                  <div
                    key={i.value}
                    className={cn(
                      "flex items-center w-full h-6 gap-4 pt-5 pb-5 cursor-pointer",
                      hasSeperator && "border-b border-gray-200"
                    )}
                    onClick={() => {
                      if (isChecked) {
                        removeProfiteer(i.value);
                      } else {
                        addProfiteer(i.value);
                      }
                    }}
                  >
                    <Checkbox
                      id={i.value + "__newExpense"}
                      checked={isChecked}
                    />
                    <div className="text-sm select-none flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                      {i.name}
                    </div>
                    {profits && (
                      <ProfiteerInput
                        disabled={!isChecked}
                        totalAmount={amount}
                        percentage={profiteer.share}
                        amount={amount * profiteer.share}
                        onPercentageChange={(value) => {
                          setProfiteerPercentage(i.value, value);
                        }}
                        onAmountChange={(value) => {
                          setProfiteerAmount(i.value, value);
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "..." : "Create"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
