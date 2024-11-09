"use client";

import { Clipboard, Check } from "lucide-react";
import NoSSR from "@/components/NoSSR";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { SplidJs } from "splid-js";
import { StorageGroupMeta } from "@/app/page";

export default function AppSidebar() {
  const storageValue =
    typeof localStorage === "undefined"
      ? null
      : localStorage.getItem("splid:groups");

  const groups: {
    group: { shortCode: string; objectId: string };
    groupInfo: SplidJs.GroupInfo;
    meta: StorageGroupMeta;
  }[] = storageValue ? JSON.parse(storageValue) : [];

  return (
    <NoSSR>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Your groups</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groups.map((item) => (
                  <SidebarMenuItem key={item.group.objectId}>
                    <SidebarMenuButton asChild>
                      <Link href={"/groups/" + item.group.objectId}>
                        {item.meta.totalBalance === "0.00" ||
                        item.meta.totalBalance === "-0.00" ? (
                          <Check />
                        ) : (
                          <Clipboard />
                        )}
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <div>
                            <span>
                              {item.groupInfo.name || "Unknown group"}
                            </span>
                            <span style={{ whiteSpace: "nowrap" }}>
                              {item.meta.totalBalance} €
                            </span>
                          </div>
                          <span>
                            {item.meta.numMembers} members,{" "}
                            {item.meta.numExpenses} items
                          </span>
                        </div>
                      </Link>
                      {/* <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a> */}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </NoSSR>
  );
}
