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
}: {
  errorMessage?: React.ReactNode;
  members: { value: string; name: string }[];
  value?: string;
  onValueChange: (value: string) => void;
}) {
  const hasError = !!errorMessage;

  return (
    <div className="flex flex-col">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn(
            "w-[180px]",
            hasError && "border-red-500 focus:ring-red-500"
          )}
        >
          <SelectValue placeholder="None" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {members.map((i) => (
              <SelectItem value={i.value} key={i.value}>
                {i.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {hasError && <p className="text-sm text-red-500 mt-1">{errorMessage}</p>}
    </div>
  );
}
