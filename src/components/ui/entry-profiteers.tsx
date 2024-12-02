import { ViewProfiteer } from "@/ViewEntry";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { cn } from "@/lib/utils";
import { useCurrencyInput } from "../useCurrencyInput";
import { useFullInputSelection } from "../useFullInputSelection";

function SplidAvatar({
  name,
  color,
  className,
  style,
}: {
  name?: string;
  color?: { dark: string; light: string };
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

        background: color?.light ?? "gray",
        color: color?.dark ?? "darkgray",

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
    color: { dark: string; light: string };
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
      <HoverCardContent className="flex flex-col">
        {profiteers.map((i) => {
          const member = members.find((j) => j.value === i.id);

          return (
            <div key={i.id} className="flex items-center">
              <SplidAvatar name={member?.name} color={member?.color} />
              <div className="ml-2">{member?.name || "Unknown"}</div>
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
  percentage,
  amount,

  onPercentageChange,
  onAmountChange,
}: {
  percentage: number;
  amount: number;

  onPercentageChange: (value: number) => void;
  onAmountChange: (value: number) => void;

  format?: Intl.NumberFormat;
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
    <div className="flex h-6 ml-auto rounded-sm overflow-hidden font-normal w-fit">
      <input
        className="pl-1 pr-1 pt-0.5 pb-0.5 bg-gray-100 border-l-2 border-white text-gray-700 h-6 w-14 focus:outline-none"
        onClick={(e) => e.stopPropagation()}
        style={{
          color: "#FF9700",
          lineHeight: "1.5rem",
          verticalAlign: "middle",
        }}
        {...useCurrencyInput(percentage, onPercentageChange, percentageFormat)}
        {...useFullInputSelection(() => {})}
      />
      <input
        className="pl-1 pr-1 pt-0.5 pb-0.5 bg-gray-100 border-l-2 border-white text-gray-700 h-6 w-14 focus:outline-none"
        onClick={(e) => e.stopPropagation()}
        {...useCurrencyInput(amount, onAmountChange, currencyFormat)}
        {...useFullInputSelection(() => {})}
      />
    </div>
  );
}
