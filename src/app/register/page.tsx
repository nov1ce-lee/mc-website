"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import { Loader2, UserPlus, Search, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface MojangProfile {
  name: string;
  uuid: string;
  avatarUrl: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [minecraftUsername, setMinecraftUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [error, setError] = useState("");
  const [mojangProfile, setMojangProfile] = useState<MojangProfile | null>(null);
  const [lookupError, setLookupError] = useState("");

  const handleLookup = useCallback(async () => {
    if (!minecraftUsername.trim()) return;

    setLookingUp(true);
    setLookupError("");
    setMojangProfile(null);

    try {
      const response = await fetch(
        `/api/mojang/lookup?username=${encodeURIComponent(minecraftUsername.trim())}`
      );

      if (!response.ok) {
        const data = await response.json();
        setLookupError(data.error || "查询失败");
        return;
      }

      const data = await response.json();
      setMojangProfile(data);
    } catch {
      setLookupError("查询失败，请稍后重试");
    } finally {
      setLookingUp(false);
    }
  }, [minecraftUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码长度至少为6位");
      return;
    }

    if (!mojangProfile) {
      setError("请先验证你的 Minecraft 正版账号");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: mojangProfile.name,
          minecraftUUID: mojangProfile.uuid,
          minecraftName: mojangProfile.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "注册失败");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("注册成功，但自动登录失败，请前往登录页面");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#2D932D] rounded-2xl mb-6 shadow-[4px_4px_0px_0px_#1a5a1a]">
            <UserPlus className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 font-mono">注册</h1>
          <p className="mt-2 text-slate-600">绑定正版账号，加入社区</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D932D] focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6位密码"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D932D] focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-2">
                确认密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D932D] focus:border-transparent transition-all text-sm"
              />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4">
                <h3 className="text-sm font-bold text-blue-800 mb-1">绑定 Minecraft 正版账号</h3>
                <p className="text-xs text-blue-700">
                  输入你的 Minecraft 用户名，系统将自动查询并验证你的正版身份
                </p>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={minecraftUsername}
                    onChange={(e) => {
                      setMinecraftUsername(e.target.value);
                      setMojangProfile(null);
                      setLookupError("");
                    }}
                    placeholder="输入 Minecraft 用户名"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D932D] focus:border-transparent transition-all text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={lookingUp || !minecraftUsername.trim()}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-bold text-white bg-[#0078D4] hover:bg-[#106EBE] transition-all rounded-md shadow-[3px_3px_0px_0px_#005A9E] disabled:opacity-50 disabled:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  {lookingUp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  查询
                </button>
              </div>

              {lookupError && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  {lookupError}
                </div>
              )}

              {mojangProfile && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={mojangProfile.avatarUrl}
                      alt={mojangProfile.name}
                      className="h-14 w-14 rounded-lg border-2 border-green-300 shadow-sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-bold text-green-800">验证成功</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Minecraft 用户名: <span className="font-bold">{mojangProfile.name}</span>
                      </p>
                      <p className="text-xs text-green-600 font-mono">
                        UUID: {mojangProfile.uuid}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !mojangProfile}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold text-white bg-[#2D932D] hover:bg-[#257a25] transition-all rounded-md shadow-[4px_4px_0px_0px_#1a5a1a] disabled:opacity-50 disabled:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UserPlus className="h-5 w-5" />
              )}
              注册并登录
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              已有账号？{' '}
              <Link href="/login" className="text-[#2D932D] hover:text-[#257a25] font-bold transition-colors">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
