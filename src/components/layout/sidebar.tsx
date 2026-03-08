"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CalendarDays,
  DollarSign,
  AlertTriangle,
  Megaphone,
  BarChart3,
  Settings,
  UserCog,
  User,
  LogOut,
  Music,
  Mail,
  UserPlus,
  Award,
} from "lucide-react";
import { useAuth } from "@/lib/hooks";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY", "TREASURER", "SECTION_LEADER", "MEMBER"] },
  { href: "/members", label: "Members", icon: Users, roles: ["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY", "SECTION_LEADER"] },
  { href: "/attendance", label: "Attendance", icon: ClipboardCheck, roles: ["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY", "SECTION_LEADER"] },
  { href: "/penalties", label: "Penalties", icon: AlertTriangle, roles: ["SUPER_ADMIN", "CHOIR_DIRECTOR", "TREASURER"] },
  { href: "/payments", label: "Payments", icon: DollarSign, roles: ["SUPER_ADMIN", "TREASURER"] },
  { href: "/events", label: "Events", icon: CalendarDays, roles: ["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY", "SECTION_LEADER", "MEMBER"] },
  { href: "/announcements", label: "Announcements", icon: Megaphone, roles: ["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY", "SECTION_LEADER", "MEMBER"] },
  { href: "/inquiries", label: "Inquiries", icon: Mail, roles: ["SUPER_ADMIN", "SECRETARY", "CHOIR_DIRECTOR"] },
  { href: "/applications", label: "Applications", icon: UserPlus, roles: ["SUPER_ADMIN", "SECRETARY", "CHOIR_DIRECTOR"] },
  { href: "/manage-accolades", label: "Accolades", icon: Award, roles: ["SUPER_ADMIN", "CHOIR_DIRECTOR"] },
  { href: "/manage-songs", label: "Songs & Media", icon: Music, roles: ["SUPER_ADMIN", "CHOIR_DIRECTOR"] },
  { href: "/manage-leaders", label: "Leadership", icon: Users, roles: ["SUPER_ADMIN", "CHOIR_DIRECTOR"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY", "TREASURER"] },
  { href: "/users", label: "Users", icon: UserCog, roles: ["SUPER_ADMIN"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["SUPER_ADMIN"] },
  { href: "/my-profile", label: "My Profile", icon: User, roles: ["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY", "TREASURER", "SECTION_LEADER", "MEMBER"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role || "MEMBER";

  const navItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-gray-200">
      <div className="flex items-center gap-2 h-16 px-4 border-b border-gray-200">
        <Music className="h-7 w-7 text-blue-600" />
        <div className="flex flex-col">
          <span className="font-bold text-sm text-gray-900">Angels Church Choir</span>
          <span className="text-xs text-gray-500">{user?.member ? `${user.member.firstName} ${user.member.lastName}` : user?.username}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-gray-200 p-3">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
