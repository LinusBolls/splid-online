const shiftDecimalSeperator = (
  inputString: string,
  formatter: Intl.NumberFormat
): number => {
  const { minimumFractionDigits } = formatter.resolvedOptions();

  const { decimalSeparator, groupSeparator } = getSeperators(formatter);

  const num = parseCurrency(inputString, formatter);

  if (isNaN(num)) {
    throw new Error("Invalid input: not a number");
  }

  // Remove currency symbols and grouping separators, then replace the decimal separator
  const sanitizedString = inputString
    .replace(new RegExp(`\\${groupSeparator}`, "g"), "") // Remove grouping separators
    .replace(new RegExp(`\\${decimalSeparator}`), ".") // Replace localized decimal with '.'
    .replace(/[^\d.-]/g, ""); // Remove all non-numeric characters (except . and -)

  const decimalPlaces = sanitizedString.includes(".")
    ? sanitizedString.length - sanitizedString.indexOf(".") - 1
    : 0;

  return num * 10 ** (decimalPlaces - (minimumFractionDigits ?? 0));
};

const getSeperators = (format: Intl.NumberFormat) => {
  const parts = format.formatToParts(12345.67);

  const decimalSeparator =
    parts.find((part) => part.type === "decimal")?.value || ".";
  const groupSeparator =
    parts.find((part) => part.type === "group")?.value || ",";

  return {
    decimalSeparator,
    groupSeparator,
  };
};

const parseCurrency = (
  currencyString: string,
  locale: Intl.NumberFormat | string = "en-US"
): number => {
  const formatter =
    locale instanceof Intl.NumberFormat
      ? locale
      : new Intl.NumberFormat(locale);

  const { decimalSeparator, groupSeparator } = getSeperators(formatter);

  // Remove currency symbols and grouping separators, then replace the decimal separator
  const sanitizedString = currencyString
    .replace(new RegExp(`\\${groupSeparator}`, "g"), "") // Remove grouping separators
    .replace(new RegExp(`\\${decimalSeparator}`), ".") // Replace localized decimal with '.'
    .replace(/[^\d.-]/g, ""); // Remove all non-numeric characters (except . and -)

  return parseFloat(sanitizedString);
};

export function useCurrencyInput<El extends HTMLInputElement>(
  valueProp: number,
  onValueChange: (value: number) => void,
  locale: Intl.NumberFormat | string = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    minimumIntegerDigits: 1,
  })
) {
  const formatter =
    locale instanceof Intl.NumberFormat
      ? locale
      : new Intl.NumberFormat(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          minimumIntegerDigits: 1,
        });

  const placeholder = formatter.format(0);
  const value = formatter.format(valueProp);

  const onChange: React.ChangeEventHandler<El> = (e) => {
    if (e.target.value === "") {
      onValueChange(0);

      return;
    }
    const valueFloat = parseCurrency(e.target.value, formatter);

    const { decimalSeparator } = getSeperators(formatter);

    const valueFloatExactlyTwoDecimals = shiftDecimalSeperator(
      e.target.value,
      formatter
    );

    const hasMultipleDecimalMarks =
      (e.target.value.match(decimalSeparator)?.length ?? 0) > 1;

    if (Number.isNaN(valueFloat)) return;
    if (hasMultipleDecimalMarks) return;

    onValueChange(valueFloatExactlyTwoDecimals);
  };

  return {
    placeholder,
    value,
    onChange,
  };
}
