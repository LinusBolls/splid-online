"use client";

import { redirect } from "next/navigation";
import useSplidGroups from "@/useSplidGroups";

export default function Page() {
  const { groups, groupsAreLoaded } = useSplidGroups();

  if (groupsAreLoaded) {
    if (groups.length) {
      redirect("/groups/" + groups[0].group.objectId);
    } else {
      redirect("/groups/join");
    }
  }
  return null;
}
