import { ViewCategory } from "@/ViewEntry";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

export default function ExpenseCategorySelect({
  categories,
  value,
  onValueChange,
  ...rest
}: {
  categories: ViewCategory[];
  value?: string;
  onValueChange: (value?: ViewCategory) => void;
  id?: string;
}) {
  return (
    <Select
      {...rest}
      value={value ?? ""}
      onValueChange={(id) =>
        onValueChange(categories.find((i) => i.value === id))
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="None" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {categories
            .filter((i) => i.isCustom)
            .map((i) => (
              <SelectItem value={i.value} key={i.value}>
                {i.title}
              </SelectItem>
            ))}
        </SelectGroup>
        {categories.filter((i) => i.isCustom).length ? (
          <SelectSeparator />
        ) : null}
        <SelectGroup>
          {categories
            .filter((i) => !i.isCustom)
            .map((i) => (
              <SelectItem value={i.value} key={i.value}>
                {i.title}
              </SelectItem>
            ))}
        </SelectGroup>
        <SelectSeparator />
        <button
          className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent"
          onClick={async () => {
            onValueChange(undefined);
          }}
        >
          None
        </button>
      </SelectContent>
    </Select>
  );
}
