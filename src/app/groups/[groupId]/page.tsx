"use client";

import { use } from "react";
import { LoaderCircle } from "lucide-react";

import GroupOverviewScreen from "@/screens/GroupOverview";
import useSplidGroup from "@/useSplidGroup";
import useSplidGroups from "@/useSplidGroups";
import { redirect } from "next/navigation";

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

  const { groupInfo, members, entries, saveEntries } = useSplidGroup(
    group?.group.extendedShortCode.slice(0, 9)
  );

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

  return (
    <GroupOverviewScreen
      groupInfo={groupInfo}
      members={members}
      entries={entries}
      saveEntries={saveEntries}
    />
  );
}
