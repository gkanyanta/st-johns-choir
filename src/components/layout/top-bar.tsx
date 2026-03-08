"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks";
import { ROLE_LABELS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, LogOut, User, Music, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

export function TopBar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const initials = user?.member
    ? `${user.member.firstName[0]}${user.member.lastName[0]}`
    : user?.username?.slice(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4 md:px-6 md:ml-64">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Sidebar />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 md:hidden">
            <Music className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-sm">Angels Church Choir</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 outline-none"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900">
                {user?.member ? `${user.member.firstName} ${user.member.lastName}` : user?.username}
              </span>
              <span className="text-xs text-gray-500">
                {ROLE_LABELS[user?.role || "MEMBER"]}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                <Link
                  href="/my-profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
