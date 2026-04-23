"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Pickaxe, LogOut, Menu, Shield } from "lucide-react";
import LoginButton from "@/components/auth/LoginButton";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#2D932D] p-1.5 rounded-md group-hover:rotate-12 transition-transform shadow-[2px_2px_0px_0px_#1a5a1a]">
              <Pickaxe className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">
              坩埚<span className="text-[#2D932D]">服</span>
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/status" className="text-sm font-medium text-slate-600 hover:text-[#2D932D] transition-colors">
            服务器状态
          </Link>
          <Link href="/archives" className="text-sm font-medium text-slate-600 hover:text-[#2D932D] transition-colors">
            建筑与机器档案
          </Link>
          <Link href="/forum" className="text-sm font-medium text-slate-600 hover:text-[#2D932D] transition-colors">
            群友唠嗑区
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              {(session.user?.role === "ADMIN" || session.user?.role === "OWNER") && (
                <Link
                  href="/admin"
                  className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors rounded-lg"
                  title="管理后台"
                >
                  <Shield className="h-5 w-5" />
                </Link>
              )}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
              >
                <img
                  src={`https://mc-heads.net/avatar/${session.user?.name || "steve"}/24`}
                  alt="avatar"
                  className="h-6 w-6 rounded-sm shadow-sm"
                />
                <span className="text-sm font-medium text-slate-700">{session.user?.name}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg"
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
