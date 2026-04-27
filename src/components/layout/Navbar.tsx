"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Pickaxe, Shield } from "lucide-react";
import LoginButton from "@/components/auth/LoginButton";
import { resolveAvatarUrl } from "@/lib/avatar";

const navLinks = [
  { href: "/status", label: "\u670d\u52a1\u5668\u72b6\u6001" },
  { href: "/map", label: "\u5b9e\u65f6\u5730\u56fe" },
  { href: "/archives", label: "\u5efa\u7b51\u4e0e\u673a\u5668\u6863\u6848" },
  { href: "/forum", label: "\u7fa4\u53cb\u804a\u5929\u533a" },
];

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="group flex items-center gap-2">
            <div className="rounded-md bg-[#2D932D] p-1.5 shadow-[2px_2px_0px_0px_#1a5a1a] transition-transform group-hover:rotate-12">
              <Pickaxe className="h-6 w-6 text-white" />
            </div>
            <span className="font-mono text-xl font-bold tracking-tight text-slate-900">
              {"\u5769\u57da"}
              <span className="text-[#2D932D]">{"\u670d"}</span>
            </span>
          </Link>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#2D932D]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              {(session.user?.role === "ADMIN" || session.user?.role === "OWNER") && (
                <Link
                  href="/admin"
                  className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
                  title="\u7ba1\u7406\u540e\u53f0"
                >
                  <Shield className="h-5 w-5" />
                </Link>
              )}
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 transition-colors hover:bg-slate-200"
              >
                <img
                  src={resolveAvatarUrl(session.user?.image, session.user?.name, 24)}
                  alt="avatar"
                  className="h-6 w-6 rounded-sm shadow-sm"
                />
                <span className="text-sm font-medium text-slate-700">{session.user?.name}</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: `${window.location.origin}/` })}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
                title="\u9000\u51fa\u767b\u5f55"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </nav>
  );
}
