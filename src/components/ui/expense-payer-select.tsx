import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export default function ExpensePayerSelect({
  members,
  value,
  onValueChange,
  errorMessage,
  ...rest
}: {
  errorMessage?: React.ReactNode;
  members: { value: string; name: string }[];
  value?: string;
  onValueChange: (value: string) => void;
  id?: string;
}) {
  const hasError = !!errorMessage;

  console.log(members);

  return (
    <div className="flex flex-col">
      <Select value={value} onValueChange={onValueChange} {...rest}>
        <SelectTrigger
          className={cn(
            "w-[180px]",
            hasError && "border-red-500 focus:ring-red-500"
          )}
          data-testid="new-expense__by--trigger"
        >
          <SelectValue placeholder="None" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {members.map((i) => (
              <SelectItem
                data-testid={"expense-payer-select-option--" + i.value}
                value={i.value}
                key={i.value}
              >
                {i.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {hasError && (
        <p
          className="text-sm text-red-500 mt-1"
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
