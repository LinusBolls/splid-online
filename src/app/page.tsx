"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

import CodeInputScreen from "@/screens/CodeInput";
import useSplidGroup from "@/useSplidGroup";
import useSplidGroups from "@/useSplidGroups";
import { LoaderCircle } from "lucide-react";

export default function Page() {
  const codeLength = 9;
  const [code, setCode] = useState("");

  const { groups, saveGroup } = useSplidGroups();

  const { group, groupInfo, members, entries } = useSplidGroup(code);

  useEffect(() => {
    if (groups.length) {
      redirect("/groups/" + groups[0].group.objectId);
    }
  }, [groups]);

  useEffect(() => {
    if (
      group == null ||
      groupInfo == null ||
      members == null ||
      entries == null
    ) {
    } else {
      saveGroup({ group, groupInfo, members, entries });

      redirect("/groups/" + group?.objectId);
    }
  }, [group, groupInfo, members, entries]);

  if (code.length < codeLength) {
    return (
      <CodeInputScreen
        codeLength={codeLength}
        code={code}
        onCodeChange={setCode}
      />
    );
  }
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
