"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Copy,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { SplidClient, SplidJs } from "splid-js";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { DatePicker } from "./ui/date-picker";
import { ViewCategory, ViewEntry } from "@/ViewEntry";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { CurrencyInput } from "./ui/currency-input";
import { currency } from "./ui/currency";

export const getColumns = (
  categories: ViewCategory[],
  members: { value: string; name: string }[],
  groupInfo: SplidJs.GroupInfo,
  saveEntries: (entries: ViewEntry[]) => Promise<void>
): ColumnDef<ViewEntry>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Input
        placeholder="Title*"
        defaultValue={row.original.title ?? ""}
        required
        onChange={(e) => {
          row.original.setTitle(e.target.value);
        }}
        onFocus={(e) => e.target.select()}
        // onBlur={async () => {
        //   alert("submitting");

        //   await saveEntries([row.original]);
        // }}
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            await saveEntries([row.original]);
          }
        }}
      />
    ),
  },
  {
    accessorKey: "primaryPayer",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          By
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Select
          value={row.original.primaryPayer}
          onValueChange={(id) => {
            row.original.setPrimaryPayer(id);
            saveEntries([row.original]);
          }}
        >
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
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = row.original.amount;

      if (row.original.items.length > 1) {
        const formatted = new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(amount);

        return (
          <Popover>
            <PopoverTrigger>
              {formatted} ({row.original.items.length} items)
            </PopoverTrigger>
            <PopoverContent>TODO: edit items here</PopoverContent>
          </Popover>
        );
      }
      /* eslint-disable-next-line react-hooks/rules-of-hooks */
      const [v, setV] = React.useState(amount);

      return (
        <CurrencyInput
          value={v}
          onChange={setV}
          onSubmit={() => {
            if (v !== row.original.amount) {
              row.original.setAmount(v);

              saveEntries([row.original]);
            }
          }}
          currencyRates={Object.entries(groupInfo.currencyRates).map(
            ([value, factor]) => ({
              value,
              factor,
              isFavorite: ["EUR", "USD"].includes(value),
              symbol: currency[value]?.symbol ?? "?",
            })
          )}
          currencyCode={row.original.currencyCode}
          onCurrencyCodeChange={(value) => {
            row.original.setCurrency(value, groupInfo.currencyRates);

            saveEntries([row.original]);
          }}
        />
      );
    },
  },
  {
    accessorKey: "purchased",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Purchased
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.original.purchasedDate;

      return (
        <DatePicker
          date={value!}
          onChange={(date) => {
            row.original.setPurchasedDate(date);

            saveEntries([row.original]);
          }}
          defaultMonth={value ?? row.original.createdDate}
        />
      );
    },
  },
  {
    accessorKey: "created",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value: Date = row.original.createdDate;

      return (
        <div className="text-right font-medium">
          {format(value, "MMM d yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rawValue = row.original.category;

      const value = rawValue
        ? rawValue.isCustom
          ? rawValue.title
          : rawValue.value
        : undefined;

      return (
        <Select
          value={value}
          onValueChange={(id) => {
            row.original.setCategory(categories.find((i) => i.value === id));
            saveEntries([row.original]);
          }}
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
                row.original.setCategory(undefined);
                await saveEntries([row.original]);
              }}
            >
              None
            </button>
          </SelectContent>
        </Select>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={async () => {
                const splid = new SplidClient();

                await splid.entry.create(row.original._raw);

                const entry = row.original.getCopy();

                await saveEntries([entry]);
              }}
            >
              <Copy />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                row.original.setIsDeleted(true);

                await saveEntries([row.original]);
              }}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function EntriesTable({
  entries,
  members,
  groupInfo,
  saveEntries,
}: {
  entries: ViewEntry[];
  members: SplidJs.Person[];
  groupInfo: SplidJs.GroupInfo;
  saveEntries: (entries: ViewEntry[]) => Promise<void>;
}) {
  console.time("foo");

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const categories = (groupInfo.customCategories ?? [])
    .map((i) => ({
      isCustom: true,
      value: i,
      title: i,
    }))
    .concat([
      { isCustom: false, value: "accommodation", title: "Accommodation" },
      { isCustom: false, value: "entertainment", title: "Entertainment" },
      { isCustom: false, value: "groceries", title: "Groceries" },
      { isCustom: false, value: "restaurants", title: "Restaurants" },
      { isCustom: false, value: "transport", title: "Transport" },
    ]);

  const processedMembers = members.map((i) => ({
    value: i.GlobalId,
    name: i.name,
  }));

  const columns = React.useMemo(
    () => getColumns(categories, processedMembers, groupInfo, saveEntries),
    [categories, processedMembers, groupInfo, saveEntries]
  );

  const [pageIndex, setPageIndex] = React.useState(0);

  const table = useReactTable({
    data: entries,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize: 12,
      },
    },
  });

  console.timeEnd("foo");

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-4">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button variant="destructive">Delete</Button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(pageIndex - 1)}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="flex-1 text-sm text-muted-foreground">
            {pageIndex + 1} / {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(pageIndex + 1)}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
