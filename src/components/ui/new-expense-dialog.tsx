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

export interface CreateExpenseInput {
  title: string;
  category: string;
  by: string;
  amount: number;
  currencyCode: string;
  date?: Date;
}
export interface NewExpenseDialogProps {
  currencyRates: CurrencyRates;
  categories: ViewCategory[];
  members: { value: string; name: string }[];
  defaultCurrencyCode: string;
  onSubmit: (expense: CreateExpenseInput) => void;
}
export default function NewExpenseDialog({
  currencyRates,
  categories,
  members,
  defaultCurrencyCode,
  onSubmit,
}: NewExpenseDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [by, setBy] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState<number>(0);
  const [currencyCode, setCurrencyCode] = useState<string>(defaultCurrencyCode);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSubmit = () => {
    // todo: give feedback if required fields are missing
    if (title && category && by && amount > 0) {
      onSubmit({ title, category, by, amount, currencyCode, date });
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
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
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Amount
          </Label>
          <CurrencyInput
            value={amount}
            onChange={setAmount}
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
            value={category}
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
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" onClick={handleSubmit}>
          Create
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
