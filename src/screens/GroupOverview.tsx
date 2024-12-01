import { SplidJs } from "splid-js";
import { EntriesTable } from "@/components/EntriesTable";
import { ViewEntry } from "@/ViewEntry";
import Image from "next/image";

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
  entries,
  saveEntries,
  refetchGroupData,
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
      {typeof groupInfo.wallpaperID === "string" && (
        <Image src={groupInfo.wallpaperID} alt="Group wallpaper" />
      )}
      <EntriesTable
        saveEntries={saveEntries}
        entries={entries
          .filter((i) => !i.isDeleted)
          .map((i) => new ViewEntry(i))}
        members={members.filter((i) => !i.isDeleted)}
        groupInfo={groupInfo}
        refetchGroupData={refetchGroupData}
      />
    </div>
  );
}
