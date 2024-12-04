"use client";

import { use } from "react";
import { LoaderCircle } from "lucide-react";

import GroupOverviewScreen from "@/screens/GroupOverview";
import useSplidGroup from "@/useSplidGroup";
import useSplidGroups from "@/useSplidGroups";
import { redirect } from "next/navigation";
import { GroupHeader } from "@/components/GroupHeader";

export default function Page({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groups } = useSplidGroups();

  const p = use(params);

  const group = groups.find((i) => i.group.objectId === p.groupId);

  if (typeof localStorage !== "undefined" && !group) {
    redirect("/");
  }

  const { groupInfo, members, entries, saveEntries, refetchGroupData } =
    useSplidGroup(group?.group.extendedShortCode.slice(0, 9));

  if (groupInfo == null || members == null || entries == null) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <LoaderCircle
          className="animate-spin"
          style={{
            color: "#FF9700",
          }}
        />
      </div>
    );
  }
  if (groupInfo.name) {
    document.title = groupInfo.name + " - Splid";
  }

  return (
    <div className="flex flex-col min-h-screen">
      <GroupHeader group={group} />
      <GroupOverviewScreen
        groupInfo={groupInfo}
        members={members}
        entries={entries}
        saveEntries={saveEntries}
        refetchGroupData={refetchGroupData}
      />
    </div>
  );
}
