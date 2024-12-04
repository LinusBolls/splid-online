import { SplidClient, SplidJs } from "splid-js";

export interface StoredGroup {
  group: {
    objectId: string;
    shortCode: string;
    extendedShortCode: string;
    longCode: string;
  };
  groupInfo: SplidJs.GroupInfo;
  meta: StorageGroupMeta;
}

export interface StorageGroupMeta {
  totalBalance: string;
  numExpenses: number;
  numMembers: number;
}

export default function useSplidGroups() {
  const storageValue =
    typeof localStorage === "undefined"
      ? null
      : localStorage.getItem("splid:groups");

  const groups: StoredGroup[] = storageValue ? JSON.parse(storageValue) : [];

  function saveGroup(group: {
    group: StoredGroup["group"];
    groupInfo: SplidJs.GroupInfo;
    members: SplidJs.Person[];
    entries: SplidJs.Entry[];
  }) {
    localStorage.setItem(
      "splid:groups",
      JSON.stringify([
        ...groups.filter((i) => i.group.objectId !== group.group.objectId),
        {
          group: group.group,
          groupInfo: group.groupInfo,
          meta: {
            totalBalance: SplidClient.getTotal(
              SplidClient.getBalance(
                group.members,
                group.entries,
                group.groupInfo
              )
            ),
            numExpenses: SplidClient.dedupeByGlobalId(
              group.entries.filter((i) => !i.isPayment && !i.isDeleted)
            ).length,
            numMembers: SplidClient.dedupeByGlobalId(
              group.members.filter((i) => !i.isDeleted)
            ).length,
          } as StorageGroupMeta,
        } as StoredGroup,
      ])
    );
  }
  return { groups, saveGroup };
}
