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
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/attendance", label: "Attend", icon: ClipboardCheck },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/payments", label: "Finance", icon: DollarSign },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-0.5 text-xs transition-colors",
                isActive
                  ? "text-blue-600 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-blue-600")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
