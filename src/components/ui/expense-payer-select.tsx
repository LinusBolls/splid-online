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
}: {
  members: { value: string; name: string }[];
  value?: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
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
  );
}
