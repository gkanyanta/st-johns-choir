"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, Menu, X, Heart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/accolades", label: "Accolades" },
  { href: "/songs", label: "Songs & Media" },
  { href: "/inquiry", label: "Contact Us" },
  { href: "/apply", label: "Join Us" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-full bg-blue-600 p-1.5">
                <Music className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">Angels Church Choir</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="ml-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Member Login
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block mx-3 mt-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 text-center transition-colors"
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
      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="rounded-full bg-blue-600 p-1.5">
                  <Music className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">Angels Church Choir</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Singing for the Glory of God. United in faith, harmony, and fellowship.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-sm text-gray-300 hover:text-white transition-colors">Home</Link>
                <Link href="/accolades" className="block text-sm text-gray-300 hover:text-white transition-colors">Accolades</Link>
                <Link href="/songs" className="block text-sm text-gray-300 hover:text-white transition-colors">Songs & Media</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">Get Involved</h4>
              <div className="space-y-2">
                <Link href="/apply" className="block text-sm text-gray-300 hover:text-white transition-colors">Join the Choir</Link>
                <Link href="/inquiry" className="block text-sm text-gray-300 hover:text-white transition-colors">Contact Us</Link>
                <Link href="/login" className="block text-sm text-gray-300 hover:text-white transition-colors">Member Portal</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">About</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Angels Church Choir is dedicated to glorifying God through music and worship.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-400" />
              Angels Church Choir &copy; {new Date().getFullYear()}
            </p>
            <p className="text-xs text-gray-500">Making a joyful noise unto the Lord</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
