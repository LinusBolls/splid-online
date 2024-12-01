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
import { Separator } from "./separator";
import { ScrollArea } from "./scroll-area";
import { Checkbox } from "./checkbox";

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

  const [profiteers, setProfiteers] = useState<{ id: string; share: number }[]>(
    []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showValidation, setShowValidation] = useState(false);

  const actualProfiteers = profiteers.length
    ? profiteers
    : members.map((i) => ({ id: i.value, share: 1 / members.length }));

  const numProfiteers = actualProfiteers.length;

  const handleSubmit = async () => {
    // todo: give feedback if required fields are missing
    if (title && by && amount > 0) {
      setIsSubmitting(true);

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
      setIsSubmitting(false);
      onClose();
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
              {/* <h4 className="mb-4 text-sm font-medium leading-none">For</h4> */}
              {members.map((i) => {
                const profiteer = profiteers.find((j) => j.id === i.value);

                const profits = profiteer != null;

                const formatted = new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                }).format(amount / numProfiteers);

                const everyoneProfits = profiteers.length < 1;

                return (
                  <div key={i.value}>
                    <div
                      className="flex items-center w-full gap-4 cursor-pointer"
                      onClick={() => {
                        if (profits) {
                          setProfiteers(
                            profiteers.filter((j) => j.id !== i.value)
                          );
                        } else {
                          const numProfiteerss = profiteers.length + 1;
                          setProfiteers([
                            ...profiteers.map((i) => ({
                              ...i,
                              share: 1 / numProfiteerss,
                            })),
                            { id: i.value, share: 1 / numProfiteerss },
                          ]);
                        }
                      }}
                    >
                      <Checkbox
                        id={i.value + "__newExpense"}
                        checked={profits}
                      />
                      <div className="text-sm pointer-events-none">
                        {i.name}
                      </div>
                      {(profits || everyoneProfits) && (
                        <div className="text-sm ml-auto">{formatted}</div>
                      )}
                    </div>
                    <Separator className="my-2" />
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
