import { useEffect, useState } from "react";
import useSplid from "./useSplidClient";
import { SplidClient, SplidJs } from "splid-js";
import { useToast } from "./hooks/use-toast";
import { ViewEntry } from "./ViewEntry";

export default function useSplidGroup(code?: string | null) {
  const splid = useSplid();

  const [group, setGroup] = useState<{
    objectId: string;
    shortCode: string;
    extendedShortCode: string;
    longCode: string;
  } | null>(null);
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

  async function loadGroup(inviteCode: string) {
    const group = await splid.group.getByInviteCode(inviteCode);
    const groupId = group.result.objectId;

    const [groupInfo, members, entries] = await Promise.all([
      splid.groupInfo.getOneByGroup(groupId),
      splid.person.getAllByGroup(groupId),
      splid.entry.getAllByGroup(groupId),
    ]);

    setGroup(group.result);
    setGroupInfo(groupInfo);
    setMembers(
      SplidClient.dedupeByGlobalId(members).filter((i) => !i.isDeleted)
    );
    setEntries(
      SplidClient.dedupeByGlobalId(entries).filter((i) => !i.isDeleted)
    );
  }

  useEffect(() => {
    if (!code || code.length < 9) return;

    loadGroup(code);
  }, [code]);

  return {
    group,
    groupInfo,
    members,
    entries,
    saveEntries,
  };
}
