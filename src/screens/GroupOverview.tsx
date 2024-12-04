import { SplidJs } from "splid-js";
import { EntriesTable } from "@/components/EntriesTable";
import { getMockEntry, getMockMember, ViewEntry } from "@/ViewEntry";
import useSplid from "@/useSplidClient";
import { CreateExpenseInput } from "@/components/ui/new-expense-dialog";

const mock = false;

export interface GroupOverviewScreenProps {
  groupInfo: SplidJs.GroupInfo;
  members: SplidJs.Person[];
  entries: SplidJs.Entry[];
  saveEntries: (entries: ViewEntry[]) => Promise<void>;
  refetchGroupData: () => void;
}
export default function GroupOverviewScreen({
  groupInfo,
  members,
  entries: entriesProp,
  saveEntries,
  refetchGroupData,
}: GroupOverviewScreenProps) {
  const splid = useSplid();

  async function onCreateExpense(entry: CreateExpenseInput) {
    await splid.entry.create({
      groupObjectId: groupInfo.group.objectId,
      title: entry.title,
      items: [
        {
          T: "",
          AM: entry.amount,
          P: {
            P: entry.for,
            PT: 0,
          },
        },
      ],
      primaryPayer: entry.by,
      category: entry.category
        ? {
            originalName: entry.category.title,
            type: entry.category.isCustom
              ? "custom"
              : (entry.category.value as SplidJs.EntryCategory),
          }
        : undefined,
      currencyCode: entry.currencyCode,
      date: entry.date
        ? {
            __type: "Date",
            iso: entry.date.toISOString(),
          }
        : undefined,
    });
    refetchGroupData();
  }

  const entries = entriesProp
    .filter((i) => !i.isDeleted)
    .map((i) => new ViewEntry(i));

  return (
    <div className="flex flex-col pl-4 pr-4 h-full">
      {/* {typeof groupInfo.wallpaperID === "string" && 
        // TODO: whats the wallpaper base url?
        <Image src={groupInfo.wallpaperID} alt="Group wallpaper" />
      } */}
      {mock ? (
        <EntriesTable
          entries={Array.from({ length: 1000 })
            .fill(null)
            .map((_, idx) =>
              getMockEntry(
                "Lecker Bierchen #" + idx,
                "#1",
                [
                  {
                    AM: 10,
                    P: {
                      P: { "#2": 0.25, "#3": 0.25, "#4": 0.25, "#5": 0.25 },
                      PT: 0,
                    },
                  },
                ],
                {}
              )
            )}
          members={[
            getMockMember("#1", "Bolls"),
            getMockMember("#2", "Laurin"),
            getMockMember("#3", "Thies"),
            getMockMember("#4", "Ole"),
            getMockMember("#5", "Adriana"),
            getMockMember("#6", "Adriana"),
            getMockMember("#7", "Das Institut"),
            getMockMember("#8", "Jonas"),
            getMockMember("#9", "Josephine"),
            getMockMember("#10", "Robert"),
            getMockMember("#11", "Timon"),
            getMockMember("#12", "Moritz"),
            getMockMember("#13", "Elina"),
            getMockMember("#14", "Joel"),
          ]}
          groupInfo={{
            currencyRates: { EUR: 1, USD: 1, AER: 1 },
            customCategories: ["nicer kaffee"],
            defaultCurrencyCode: "EUR",
          }}
          saveEntries={() => {}}
          onCreateExpense={() => {}}
          onDeleteEntry={() => {}}
          onDuplicateEntry={() => {}}
        />
      ) : (
        <EntriesTable
          saveEntries={saveEntries}
          entries={entries}
          members={members}
          groupInfo={groupInfo}
          onCreateExpense={onCreateExpense}
          onDeleteEntry={async (entry) => {
            entry.setIsDeleted(true);

            await saveEntries([entry]);
          }}
          onDuplicateEntry={async (entry) => {
            await splid.entry.create(entry._raw);

            const entryCopy = entry.getCopy();

            await saveEntries([entryCopy]);
          }}
        />
      )}
    </div>
  );
}
