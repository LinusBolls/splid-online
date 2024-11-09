"use client";

import { useEffect, useState } from "react";
import { SplidClient, SplidJs } from "splid-js";

import CodeInputScreen from "../../screens/CodeInput";
import GroupOverviewScreen from "../../screens/GroupOverview";
import NoSSR from "../components/NoSSR";
import { ViewEntry } from "@/ViewEntry";
import { useToast } from "@/hooks/use-toast";

export const fetchProxy: typeof fetch = async (url, init) => {
  const res = await fetch("/api/http-proxy", {
    method: "POST",
    body: JSON.stringify({ url, init }),
  });
  return res;
};

export interface StorageGroupMeta {
  totalBalance: string;
  numExpenses: number;
  numMembers: number;
}

export default function Home() {
  const codeLength = 9;

  const splid = new SplidClient({ fetch: fetchProxy });

  const [code, setCode] = useState("");
  const [groupInfo, setGroupInfo] = useState<SplidJs.GroupInfo | null>(null);
  const [members, setMembers] = useState<SplidJs.Person[] | null>(null);
  const [entries, setEntries] = useState<SplidJs.Entry[] | null>(null);

  const { toast } = useToast();

  async function saveEntries(newEntries: ViewEntry | ViewEntry[]) {
    const sachen = Array.isArray(newEntries) ? newEntries : [newEntries];

    setEntries((prev) =>
      JSON.parse(
        JSON.stringify(
          prev!.map((i) => sachen.find((j) => j.id === i.GlobalId)?._raw ?? i)
        )
      )
    );
    await splid.entry.set(sachen.map((i) => i._raw));

    toast({
      title: "Changes saved",
    });
  }

  useEffect(() => {
    const storageValue = localStorage.getItem("splid:groups");

    const groups: { group: { shortCode: string; objectId: string } }[] =
      storageValue ? JSON.parse(storageValue) : [];

    if (code.length < codeLength && groups.length) {
      setCode(groups[0].group.shortCode);
    }

    if (code.length < codeLength) return;

    (async () => {
      const group = await splid.group.getByInviteCode(code);

      group.result.shortCode = code;

      const groupId = group.result.objectId;

      const [groupInfo, members, entries] = await Promise.all([
        splid.groupInfo.getOneByGroup(groupId),
        splid.person.getAllByGroup(groupId),
        splid.entry.getAllByGroup(groupId),
      ]);

      localStorage.setItem(
        "splid:groups",
        JSON.stringify([
          {
            group: group.result,
            groupInfo,
            meta: {
              totalBalance: SplidClient.getTotal(
                SplidClient.getBalance(members, entries, groupInfo)
              ),
              numExpenses: SplidClient.dedupeByGlobalId(
                entries.filter((i) => !i.isPayment && !i.isDeleted)
              ).length,
              numMembers: SplidClient.dedupeByGlobalId(
                members.filter((i) => !i.isDeleted)
              ).length,
            } as StorageGroupMeta,
          },
        ])
      );

      // const groupInfo = await splid.groupInfo.getOneByGroup(groupId);
      // const members = await splid.person.getAllByGroup(groupId);
      // const entries = await splid.entry.getAllByGroup(groupId);

      setGroupInfo(groupInfo);
      setMembers(
        SplidClient.dedupeByGlobalId(members).filter((i) => !i.isDeleted)
      );
      setEntries(
        SplidClient.dedupeByGlobalId(entries).filter((i) => !i.isDeleted)
      );
    })();
  }, [code]);

  if (code.length < codeLength) {
    return (
      <NoSSR>
        <CodeInputScreen
          codeLength={codeLength}
          code={code}
          onCodeChange={setCode}
        />
      </NoSSR>
    );
  }

  if (groupInfo == null || members == null || entries == null) {
    return <div>loading...</div>;
  }

  return (
    <NoSSR>
      <GroupOverviewScreen
        saveEntries={saveEntries}
        groupInfo={groupInfo}
        members={members}
        entries={entries}
      />
    </NoSSR>
  );
}
