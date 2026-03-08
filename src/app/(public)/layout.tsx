"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/accolades", label: "Accolades" },
  { href: "/songs", label: "Songs & Media" },
  { href: "/inquiry", label: "Contact Us" },
  { href: "/apply", label: "Join Us" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/images/ucz-logo.png" alt="UCZ Logo" width={40} height={40} className="rounded-full" />
              <div className="flex flex-col">
                <span className="font-bold text-base text-white leading-tight">Angels Church</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400/80 font-medium">Choir</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === link.href
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="ml-3 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 text-sm font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shadow-sm"
              >
                Member Login
              </Link>
            </nav>

            {/* Mobile: login + menu button */}
            <div className="md:hidden flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 text-xs font-semibold rounded-lg"
              >
                Login
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-slate-300 hover:text-white"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-slate-700/50 py-3 space-y-1 pb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block mx-3 mt-3 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 text-sm font-semibold rounded-lg text-center"
              >
                Member Login
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/images/ucz-logo.png" alt="UCZ Logo" width={40} height={40} className="rounded-full" />
                <div className="flex flex-col">
                  <span className="font-bold text-base leading-tight">Angels Church</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400/80 font-medium">Choir</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Singing for the Glory of God. United in faith, harmony, and fellowship.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-xs uppercase tracking-widest text-amber-400/70 mb-4">Quick Links</h4>
              <div className="space-y-2.5">
                <Link href="/" className="block text-sm text-slate-400 hover:text-amber-400 transition-colors">Home</Link>
                <Link href="/accolades" className="block text-sm text-slate-400 hover:text-amber-400 transition-colors">Accolades</Link>
                <Link href="/songs" className="block text-sm text-slate-400 hover:text-amber-400 transition-colors">Songs & Media</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs uppercase tracking-widest text-amber-400/70 mb-4">Get Involved</h4>
              <div className="space-y-2.5">
                <Link href="/apply" className="block text-sm text-slate-400 hover:text-amber-400 transition-colors">Join the Choir</Link>
                <Link href="/inquiry" className="block text-sm text-slate-400 hover:text-amber-400 transition-colors">Contact Us</Link>
                <Link href="/login" className="block text-sm text-slate-400 hover:text-amber-400 transition-colors">Member Portal</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs uppercase tracking-widest text-amber-400/70 mb-4">About</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Angels Church Choir is dedicated to glorifying God through music and worship.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Heart className="h-3 w-3 text-amber-500/60" />
              Angels Church Choir &copy; {new Date().getFullYear()}
            </p>
            <p className="text-xs text-slate-500 italic">Making a joyful noise unto the Lord</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
