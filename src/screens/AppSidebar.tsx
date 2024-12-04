"use client";

import NoSSR from "@/components/NoSSR";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { StoredGroup } from "@/useSplidGroups";
import { cn } from "@/lib/utils";

export default function AppSidebar() {
  const storageValue =
    typeof localStorage === "undefined"
      ? null
      : localStorage.getItem("splid:groups");

  const groups: StoredGroup[] = storageValue ? JSON.parse(storageValue) : [];

  return (
    <NoSSR>
      <Sidebar>
        <SidebarHeader>
          <SidebarTrigger className="ml-auto" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Your groups</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groups.map((group) => {
                  if (!group.meta) return null;

                  const isNeutralBalance = ["-0.00", "0.00"].includes(
                    group.meta.totalBalance
                  );

                  return (
                    <SidebarMenuItem key={group.group.objectId}>
                      <SidebarMenuButton asChild className="h-fit">
                        <Link href={"/groups/" + group.group.objectId}>
                          {/* {isNeutralBalance ? <Check /> : <Clipboard />} */}
                          <div className="flex flex-col">
                            <div>
                              <span
                                className={cn(
                                  "whitespace-nowrap font-bold mr-2",
                                  isNeutralBalance
                                    ? "text-green-600"
                                    : "text-red-600"
                                )}
                              >
                                {group.meta.totalBalance} €
                              </span>
                              <span>
                                {group.groupInfo.name || "Unknown group"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {group.meta.numMembers} members ·{" "}
                              {group.meta.numExpenses} expenses
                            </div>
                          </div>
                        </Link>
                        {/* <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a> */}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/groups/join">Join a group</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/groups/new">Create a group</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </NoSSR>
  );
}
