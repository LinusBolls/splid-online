import { StorageGroupMeta } from "@/useSplidGroups";
import Link from "next/link";
import { SidebarTrigger } from "./ui/sidebar";
import { Menu } from "lucide-react";
import Image from "next/image";
import splidLogo from "../../public/splid-logo.png";

export interface GroupHeaderProps {
  group?: { meta: StorageGroupMeta; groupInfo: { name: string } };
}
export function GroupHeader({ group }: GroupHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm">
      <div className="flex items-center space-x-4">
        <SidebarTrigger>
          <Menu />
        </SidebarTrigger>

        <div className="flex items-center space-x-2">
          <Image src={splidLogo} alt="Splid Logo" className="h-8 w-8" />
          <span className="text-lg font-semibold">Splid</span>
        </div>

        <div className="ml-4">
          <h1 className="text-lg font-medium">{group?.groupInfo.name ?? ""}</h1>
          {group && (
            <div className="text-sm text-gray-500">
              {group.meta.numMembers} members · {group.meta.numExpenses}{" "}
              expenses
            </div>
          )}
        </div>
      </div>

      <nav className="flex space-x-6">
        <Link
          href="/about"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          About
        </Link>
        <Link
          href="/privacy"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Privacy Policy
        </Link>
      </nav>
    </header>
  );
}
