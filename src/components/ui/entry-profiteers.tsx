import { ViewProfiteer } from "@/ViewEntry";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { cn } from "@/lib/utils";
import { useCurrencyInput } from "../useCurrencyInput";
import { useFullInputSelection } from "../useFullInputSelection";
import { Input } from "./input";

function SplidAvatar({
  name,
  color,
  className,
  style,
}: {
  name?: string;
  color?: { bg: string; fg: string };
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any;
}) {
  const initials =
    name
      ?.split(" ")
      .map((i) => i[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full w-7 aspect-square border border-white font-semibold text-xs",
        className
      )}
      style={{
        marginLeft: "-0.5rem",

        background: color?.bg ?? "#D7D7D9",
        color: color?.fg ?? "#5C5C5C",

        ...(style ?? {}),
      }}
    >
      {initials}
    </div>
  );
}

export interface EntryProfiteersProps {
  profiteers: ViewProfiteer[];
  members: {
    name: string;
    value: string;
    color: { bg: string; fg: string };
  }[];
}
export default function EntryProfiteers({
  profiteers,
  members,
}: EntryProfiteersProps) {
  const allProfit = profiteers.length === members.length;

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger className="flex">
        {allProfit && <div>Everyone</div>}

        {!allProfit &&
          profiteers.map((i) => {
            const member = members.find((j) => j.value === i.id);

            return (
              <SplidAvatar
                key={i.id}
                name={member?.name}
                color={member?.color}
              />
            );
          })}
      </HoverCardTrigger>
      <HoverCardContent className="flex flex-col w-72">
        {profiteers.map((i) => {
          const member = members.find((j) => j.value === i.id);

          return (
            <div key={i.id} className="flex items-center h-8">
              <SplidAvatar name={member?.name} color={member?.color} />
              <div className="text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis ml-2">
                {member?.name || "Unknown"}
              </div>
              <ProfiteerInput
                percentage={i.share}
                amount={i.amount}
                onPercentageChange={() => {}}
                onAmountChange={() => {}}
              />
            </div>
          );
        })}
      </HoverCardContent>
    </HoverCard>
  );
}

export function ProfiteerInput({
  totalAmount,
  percentage,
  amount,

  onPercentageChange,
  onAmountChange,
  disabled = false,
}: {
  totalAmount?: number;
  percentage: number;
  amount: number;

  onPercentageChange: (value: number) => void;
  onAmountChange: (value: number) => void;

  format?: Intl.NumberFormat;
  disabled?: boolean;
}) {
  const currencyFormat = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    minimumIntegerDigits: 1,
    maximumFractionDigits: 2,

    style: "currency",
    currency: "EUR",
  });

  const percentageFormat = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    style: "percent",
  });

  return (
    <div className={"flex h-6 ml-auto font-normal w-fit gap-0.5"}>
      <Input
        disabled={disabled}
        size={percentageFormat.format(1).length}
        className={cn(
          "pl-1 pr-1 pt-0.5 pb-0.5 h-6 focus:outline-none rounded-t-sm rounded-l-sm rounded-r-none rounded-b-sm",
          disabled &&
            "border-transparent shadow-none disabled:opacity-100 disabled:cursor-text"
        )}
        onClick={(e) => e.stopPropagation()}
        style={{
          color: "#FF9700",
          lineHeight: "1.5rem",
          verticalAlign: "middle",
        }}
        {...useCurrencyInput(percentage, onPercentageChange, percentageFormat)}
        {...useFullInputSelection(() => {})}
      />
      <Input
        disabled={disabled}
        size={totalAmount ? currencyFormat.format(totalAmount).length : 9}
        className={cn(
          "pl-1 pr-1 pt-0.5 pb-0.5 h-6 focus:outline-none rounded-t-sm rounded-l-none rounded-r-sm rounded-b-sm",
          disabled &&
            "border-transparent shadow-none disabled:opacity-100 disabled:cursor-text"
        )}
        onClick={(e) => e.stopPropagation()}
        {...useCurrencyInput(amount, onAmountChange, currencyFormat)}
        {...useFullInputSelection(() => {})}
      />
    </div>
  );
}
