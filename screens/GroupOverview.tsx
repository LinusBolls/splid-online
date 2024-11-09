import { SplidJs } from "splid-js";
import { EntriesTable } from "../src/components/EntriesTable";
import { ViewEntry } from "@/ViewEntry";

export interface GroupOverviewScreenProps {
  groupInfo: SplidJs.GroupInfo;
  members: SplidJs.Person[];
  entries: SplidJs.Entry[];
  saveEntries: (entries: ViewEntry[]) => Promise<void>;
}
export default function GroupOverviewScreen({
  groupInfo,
  members,
  entries,
  saveEntries,
}: GroupOverviewScreenProps) {
  return (
    <div
      // className="dark"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "1rem",
        paddingTop: 0,
        minHeight: "100vh",

        // background: "black",
      }}
    >
      <h1>{groupInfo.name}</h1>
      <EntriesTable
        saveEntries={saveEntries}
        entries={entries
          .filter((i) => !i.isDeleted)
          .map((i) => new ViewEntry(i))}
        members={members.filter((i) => !i.isDeleted)}
        groupInfo={groupInfo}
      />
    </div>
  );
}
