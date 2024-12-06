import { ViewCategory, ViewEntry, ViewProfiteer } from "@/ViewEntry";
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
import { useEffect, useState } from "react";
import { ScrollArea } from "./scroll-area";
import { Checkbox } from "./checkbox";
import { ProfiteerInput } from "./entry-profiteers";
import { cn } from "@/lib/utils";
import { MAX_EXPENSE_AMOUNT_EUR } from "@/constants";
import { useProfiteers } from "../useProfiteers";

export interface CreateExpenseInput {
  title: string;
  category?: ViewCategory;
  primaryPayer: string;
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
  onCreate: (expense: CreateExpenseInput) => void;
  onEdit: (expense: ViewEntry) => void;

  existingExpense?: ViewEntry;
}
export default function NewExpenseDialog({
  currencyRates,
  categories,
  members,
  defaultCurrencyCode,
  onClose,
  onCreate,
  onEdit,
  existingExpense,
}: NewExpenseDialogProps) {
  useEffect(() => {
    if (existingExpense) {
      setTitle(existingExpense.title!);
      setCategory(existingExpense.category ?? undefined);
      setPrimaryPayer(existingExpense.primaryPayer);
      setAmount(existingExpense.amount);
      setCurrencyCode(existingExpense.currencyCode);
      setDate(existingExpense.purchasedDate ?? undefined);
    }
  }, [existingExpense]);

  const [title, setTitle] = useState(existingExpense?.title ?? "");
  const [category, setCategory] = useState<ViewCategory | undefined>(
    existingExpense?.category ?? undefined
  );
  const [primaryPayer, setPrimaryPayer] = useState<string | undefined>(
    existingExpense?.primaryPayer ?? undefined
  );
  const [amount, setAmount] = useState<number>(existingExpense?.amount ?? 0);
  const [currencyCode, setCurrencyCode] = useState<string>(
    existingExpense?.currencyCode ?? defaultCurrencyCode
  );
  const [date, setDate] = useState<Date | undefined>(
    existingExpense?.purchasedDate ?? new Date()
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showValidation, setShowValidation] = useState(false);

  const isNewExpense = existingExpense == null;

  const {
    profiteers,
    removeProfiteer,
    addProfiteer,
    setProfiteerPercentage,
    setProfiteerAmount,
  } = useProfiteers(amount, existingExpense?.for);

  const actualProfiteers = profiteers.length
    ? profiteers
    : members.map<ViewProfiteer>((i) => ({
        id: i.value,
        share: 1 / members.length,
        amount: amount * (1 / members.length),
      }));

  const handleSubmit = async () => {
    if (title && primaryPayer && amount > 0) {
      setIsSubmitting(true);

      try {
        const forRecord = actualProfiteers.reduce(
          (acc, i) => ({ ...acc, [i.id]: i.share }),
          {}
        );

        if (existingExpense) {
          existingExpense.setTitle(title);
          existingExpense.setPrimaryPayer(primaryPayer);
          existingExpense.setCategory(category);
          existingExpense.setAmount(amount);
          existingExpense.setCurrency(
            currencyCode,
            currencyRates.reduce(
              (acc, i) => ({ ...acc, [i.value]: i.factor }),
              {}
            )
          );
          existingExpense.setPurchasedDate(date);
          // TODO: setItems method
          existingExpense.setItems([
            {
              amount,
              title,
              profiteers: actualProfiteers,
            },
          ]);
          await onEdit(existingExpense);
        } else {
          await onCreate({
            title,
            category,
            primaryPayer,
            amount,
            currencyCode,
            date,
            for: forRecord,
          });
        }
        setTitle("");
        setCategory(undefined);
        setPrimaryPayer(undefined);
        setAmount(0);
        setCurrencyCode(defaultCurrencyCode);
        setDate(new Date());
        setShowValidation(false);
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
        <DialogTitle>
          {isNewExpense ? "New expense" : "Edit expense"}
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="new-expense__title" className="text-right">
            Title
          </Label>
          <Input
            id="new-expense__title"
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
          <Label htmlFor="new-expense__amount" className="text-right">
            Amount
          </Label>
          <CurrencyInput
            id="new-expense__amount"
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
          <Label htmlFor="new-expense__category" className="text-right">
            Category
          </Label>
          <ExpenseCategorySelect
            id="new-expense__category"
            categories={categories}
            value={category?.value}
            onValueChange={setCategory}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="new-expense__date" className="text-right">
            Date
          </Label>
          <DatePicker id="new-expense__date" date={date} onChange={setDate} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="new-expense__by" className="text-right">
            By
          </Label>
          <ExpensePayerSelect
            id="new-expense__by"
            members={members}
            value={primaryPayer}
            onValueChange={setPrimaryPayer}
            errorMessage={showValidation && title.length < 1 && "Required"}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">For</Label>
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
                    data-testid={"expense-for-select-option--" + i.value}
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
                        disabled={!isChecked || profiteers.length === 1}
                        totalAmount={amount}
                        percentage={profiteer.share}
                        amount={profiteer.amount}
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
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          data-testid="create-new-expense"
        >
          {isSubmitting ? "..." : isNewExpense ? "Create" : "Save"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
