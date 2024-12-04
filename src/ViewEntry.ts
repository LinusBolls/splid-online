import { SplidJs } from "splid-js";

export interface ViewCategory {
  isCustom: boolean;
  value: string;
  title: string;
}

export class ViewMember {
  public get name() {
    return this._raw.name;
  }
  public get id() {
    return this._raw.GlobalId;
  }
  constructor(private _raw: SplidJs.Person) {}
}

export interface ViewSecondaryPayer {
  id: string;
  amount: number;
}

export interface ViewProfiteer {
  id: string;
  share: number;
  amount: number;
  numShares?: number;
}

export interface ViewEntryItem {
  amount: number;
  title?: string;
  numShares?: number;
  profiteers: ViewProfiteer[];
}

export class ViewEntry {
  public get amount(): number {
    return this._raw.items.reduce((sum, i) => sum + i.AM, 0);
  }
  public get currencyCode(): string {
    return this._raw.currencyCode;
  }
  public get category(): ViewCategory | null {
    const raw = this._raw.category;

    if (!raw) return null;
    if ("__op" in raw) return null;

    const isCustom = raw?.type === "custom";

    return {
      isCustom,
      value: raw.type,
      title: raw.originalName,
    };
  }
  public get id(): string {
    return this._raw.GlobalId;
  }
  public get createdDate(): Date {
    const raw = this._raw.createdGlobally;

    return new Date(raw.iso);
  }
  public get purchasedDate(): Date | null {
    const raw = this._raw.date;

    if (!raw) return null;
    if ("__op" in raw) return null;

    return new Date(raw.iso);
  }
  public get isPayment(): boolean {
    return this._raw.isPayment;
  }
  public get isDeleted(): boolean {
    return this._raw.isDeleted;
  }
  public get title(): string | null {
    return this._raw.title ?? null;
  }
  public get primaryPayer(): string {
    return this._raw.primaryPayer;
  }
  public get secondaryPayers(): ViewSecondaryPayer[] | null {
    if (!this._raw.secondaryPayers) return null;

    return Object.entries(this._raw.secondaryPayers).map(([id, amount]) => {
      return {
        id,
        amount,
      };
    });
  }
  public get items(): ViewEntryItem[] {
    return this._raw.items.map<ViewEntryItem>((i) => {
      const shareSize = i.P.SS ? 1 / i.P.SS : undefined;

      return {
        amount: i.AM,
        title: i.T,
        profiteers: Object.entries(i.P.P).map<ViewProfiteer>((j) => {
          return {
            id: j[0],
            share: j[1],
            amount: j[1] * i.AM,
            numShares: shareSize ? j[1] / shareSize : undefined,
          };
        }),
        numShares: i.P.SS,
      };
    });
  }
  constructor(public _raw: SplidJs.Entry) {}

  public setTitle(title: string) {
    this._raw.title = title;

    return this;
  }
  public setPrimaryPayer(primaryPayer: string) {
    this._raw.primaryPayer = primaryPayer;

    return this;
  }
  public setCategory(category?: ViewCategory) {
    this._raw.category = category
      ? ({
          originalName: category.title,
          type: category.value,
        } as SplidJs.Entry["category"])
      : {
          __op: "Delete",
        };

    return this;
  }
  public setPurchasedDate(date?: Date) {
    this._raw.date = date
      ? {
          __type: "Date",
          iso: date.toISOString(),
        }
      : {
          __op: "Delete",
        };
    return this;
  }
  /**
   * deleted entries will not be listed
   */
  public setIsDeleted(isDeleted = true) {
    this._raw.isDeleted = isDeleted;
    return this;
  }
  /**
   * sets the `currencyCode` property and converts the `amount` to the target currency
   */
  public setCurrency(
    currencyCode: string,
    currencyRates: Record<string, number>
  ) {
    const factor =
      currencyRates[this._raw.currencyCode] / currencyRates[currencyCode];

    this._raw.currencyCode = currencyCode;

    for (const item of this._raw.items) {
      item.AM = item.AM * factor;
    }
    for (const [payerId, amount] of Object.entries(
      this._raw.secondaryPayers ?? {}
    )) {
      this._raw.secondaryPayers![payerId] = amount * factor;
    }
    return this;
  }
  public mergeSubItems() {
    const prev = this._raw.items;

    this._raw.items = prev.slice(0, 1);

    const total = prev.reduce((sum, i) => sum + i.AM, 0);

    const profiteers: Record<string, number> = {};

    for (const item of prev) {
      for (const [profiteer, share] of Object.entries(item.P.P)) {
        if (!(profiteer in profiteers)) {
          profiteers[profiteer] = 0;
        }
        profiteers[profiteer] += share * (total / item.AM);
      }
    }
    this._raw.items[0].AM = total;
    this._raw.items[0].P.P = profiteers;

    if (this._raw.title == null) {
      this._raw.title = this._raw.items[0].T;
    }

    return this;
  }
  public addSubItem(
    title = "",
    amount = 0,
    profiteers: Record<string, number> = {}
  ) {
    this._raw.items.push({
      T: title,
      AM: amount,
      P: {
        P: profiteers,
        PT: 0,
      },
    });
  }
  public deleteSubItem(index: number) {
    this._raw.items = this._raw.items.filter((_, idx) => idx !== index);
    return this;
  }
  // public setSubItems(items: SplidJs.EntryItem[]) {
  //   this._raw.items = items;
  // }

  public addSecondaryPayer(id: string, amount = 0) {
    if (!this._raw.secondaryPayers) this._raw.secondaryPayers = {};

    this._raw.secondaryPayers![id] = amount;
  }
  public deleteSecondaryPayer(id: string) {
    delete this._raw.secondaryPayers?.[id];
    return this;
  }
  // public setSecondaryPayers() {}

  public get isSplitExpense() {
    return this.items.length > 1;
  }
  public getCopy() {
    return new ViewEntry(JSON.parse(JSON.stringify(this._raw)));
  }
  public setAmount(amount: number) {
    if (this.isSplitExpense) {
      throw new Error(
        "ViewEntry.setAmount: attempted to set amount of split expense (an expense with more than one item)"
      );
    }
    this._raw.items[0].AM = amount;
    return this;
  }
}

export const getMockEntry = (
  title: string,
  primaryPayer: string,
  items: SplidJs.EntryItem[],
  {
    category,
    currencyCode,
  }: {
    category?: {
      originalName: string;
      type: string;
    };
    currencyCode?: string;
  }
) => {
  return new ViewEntry({
    __type: "Object",
    className: "Entry",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    UpdateID: "#",
    createdGlobally: {
      __type: "Date",
      iso: new Date().toISOString(),
    },
    items,
    objectId: "#",
    UpdateInstallationID: "#",
    title,
    primaryPayer,
    currencyCode: currencyCode ?? "EUR",
    GlobalId: "#",
    group: {
      __type: "Pointer",
      className: "_User",
      objectId: "#",
    },
    isDeleted: false,
    isPayment: false,
    category: category as SplidJs.Entry["category"],
  });
};

export const getMockMember = (
  id: string,
  name: string,
  initials = name[0]
) => ({
  name,
  initials,

  __type: "Object" as const,
  objectId: "#",
  className: "Person" as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdGlobally: {
    __type: "Date" as const,
    iso: new Date().toISOString(),
  },
  GlobalId: id,
  group: {
    __type: "Pointer" as const,
    className: "_User" as const,
    objectId: "#",
  },
  isDeleted: false,
  UpdateID: "#",
  UpdateInstallationID: "#",
});
