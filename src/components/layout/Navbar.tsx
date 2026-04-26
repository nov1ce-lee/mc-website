"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Pickaxe, LogOut, Shield } from "lucide-react";
import LoginButton from "@/components/auth/LoginButton";
import { resolveAvatarUrl } from "@/lib/avatar";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="rounded-md bg-[#2D932D] p-1.5 shadow-[2px_2px_0px_0px_#1a5a1a] transition-transform group-hover:rotate-12">
              <Pickaxe className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">
              坩埚<span className="text-[#2D932D]">服</span>
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/status"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-[#2D932D]"
          >
            服务器状态
          </Link>
          <Link
            href="/archives"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-[#2D932D]"
          >
            建筑与机器档案
          </Link>
          <Link
            href="/forum"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-[#2D932D]"
          >
            群友唠嗑区
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              {(session.user?.role === "ADMIN" || session.user?.role === "OWNER") && (
                <Link
                  href="/admin"
                  className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
                  title="管理后台"
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
                title="退出登录"
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
