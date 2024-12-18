"use client";

import React, { useState, useMemo } from "react";
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
import { SplidJs } from "splid-js";
import { DatePicker } from "./ui/date-picker";
import { ViewCategory, ViewEntry, ViewProfiteer } from "@/ViewEntry";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { CurrencyInput } from "./ui/currency-input";
import { currency } from "./ui/currency";
import { Dialog } from "@/components/ui/dialog";

import NewExpenseDialog, { CreateExpenseInput } from "./ui/new-expense-dialog";
import ExpenseCategorySelect from "./ui/expense-category-select";
import ExpensePayerSelect from "./ui/expense-payer-select";
import EntryProfiteers from "./ui/entry-profiteers";
import { assignAvatarColors } from "./colors";
import { MAX_EXPENSE_AMOUNT_EUR, NUM_ENTRY_TABLE_ROWS } from "@/constants";
import { useExpenseDraft } from "@/stores/expenseDraftStore";

type EntriesTableGroupInfo = Pick<
  SplidJs.GroupInfo,
  "defaultCurrencyCode" | "currencyRates" | "customCategories"
>;

export const getColumns = (
  categories: ViewCategory[],
  members: {
    value: string;
    name: string;
    initials: string;
    color: { bg: string; fg: string };
  }[],
  groupInfo: EntriesTableGroupInfo,
  saveEntries: (entries: ViewEntry[]) => void,
  onDuplicateEntries: (entry: ViewEntry[]) => void,
  onDeleteEntries: (entry: ViewEntry[]) => void
): ColumnDef<ViewEntry>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        data-testid="select-all-rows"
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
        data-testid="select-row"
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
        <ExpensePayerSelect
          members={members}
          value={row.original.primaryPayer}
          onValueChange={(id) => {
            row.original.setPrimaryPayer(id);
            saveEntries([row.original]);
          }}
        />
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
          onChange={(value) => {
            if (value <= MAX_EXPENSE_AMOUNT_EUR) setV(value);
          }}
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
          date={value}
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
    accessorKey: "for",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          For
        </Button>
      );
    },
    cell: ({ row }) => {
      const uniqueProfiteers = row.original.items.reduce<ViewProfiteer[]>(
        (acc, i) =>
          acc.concat(
            i.profiteers.filter((j) => !acc.some((k) => k.id === j.id))
          ),
        []
      );

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { openEditExpenseModal } = useExpenseDraft();

      return (
        <EntryProfiteers
          profiteers={uniqueProfiteers}
          members={members}
          amount={row.original.amount}
          onChange={async () => {
            alert("saved");
            // const items = row.original.items.map((i) => ({
            //   ...i,
            //   profiteers: profiteers.filter((j) =>
            //     i.profiteers.some((k) => k.id === j.id)
            //   ),
            // }));
            // row.original.setItems(items);
            // saveEntries([row.original]);
          }}
          onEdit={() => openEditExpenseModal(row.original.id)}
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
        <ExpenseCategorySelect
          categories={categories}
          value={value}
          onValueChange={(value) => {
            row.original.setCategory(
              categories.find((i) => i.value === value?.value)
            );
            saveEntries([row.original]);
          }}
        />
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
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              data-testid="open-entry-actions"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              data-testid="duplicate-entry"
              onClick={() => onDuplicateEntries([row.original])}
            >
              <Copy />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              data-testid="delete-entry"
              onClick={() => onDeleteEntries([row.original])}
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
  onCreateExpense,
  onEditExpense,
  onDuplicateEntries,
  onDeleteEntries,
}: {
  entries: ViewEntry[];
  members: SplidJs.Person[];
  groupInfo: EntriesTableGroupInfo;
  saveEntries: (entries: ViewEntry[]) => void;
  onCreateExpense: (expense: CreateExpenseInput) => void;
  onEditExpense: (expense: ViewEntry) => void;
  onDuplicateEntries: (entry: ViewEntry[]) => void;
  onDeleteEntries: (entry: ViewEntry[]) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);

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
    initials: i.initials,
    color: assignAvatarColors(members)[i.GlobalId],
  }));

  const columns = useMemo(
    () =>
      getColumns(
        categories,
        processedMembers,
        groupInfo,
        saveEntries,
        onDuplicateEntries,
        onDeleteEntries
      ),
    [categories, processedMembers, groupInfo, saveEntries]
  );

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
        pageSize: NUM_ENTRY_TABLE_ROWS,
      },
    },
  });

  const { expenseBeingEditedId, closeEditExpenseModal } = useExpenseDraft();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Search by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Dialog open={isCreateExpenseOpen || expenseBeingEditedId != null}>
          <Button
            variant="outline"
            onClick={() => setIsCreateExpenseOpen(true)}
            data-testid="new-expense"
          >
            New expense
          </Button>
          <NewExpenseDialog
            existingExpense={entries.find((i) => i.id === expenseBeingEditedId)}
            onClose={() =>
              expenseBeingEditedId
                ? closeEditExpenseModal()
                : setIsCreateExpenseOpen(false)
            }
            members={processedMembers}
            categories={categories}
            defaultCurrencyCode={groupInfo.defaultCurrencyCode}
            currencyRates={Object.entries(groupInfo.currencyRates).map(
              ([value, factor]) => ({
                value,
                factor,
                isFavorite: ["EUR", "USD"].includes(value),
                symbol: currency[value]?.symbol ?? "?",
              })
            )}
            onEdit={onEditExpense}
            onCreate={onCreateExpense}
          />
        </Dialog>
        <div className="flex gap-4">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              data-testid="delete-selected-entries"
              variant="destructive"
              onClick={() => {
                const toBeDeleted = table
                  .getFilteredSelectedRowModel()
                  .rows.map((i) => i.original);

                onDeleteEntries(toBeDeleted);
              }}
            >
              Delete
            </Button>
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
      <div className="flex items-center justify-end space-x-2 py-4 mt-auto">
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
