"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CheckCircle, Loader2, Search, UserPlus, XCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

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
    const username = minecraftUsername.trim();
    if (!username) {
      return;
    }

    setLookingUp(true);
    setLookupError("");
    setMojangProfile(null);

    try {
      const response = await fetch(`/api/mojang/lookup?username=${encodeURIComponent(username)}`);

      if (!response.ok) {
        const result = await response.json();
        setLookupError(result.error || "查询失败");
        return;
      }

      const result = await response.json();
      setMojangProfile(result);
    } catch {
      setLookupError("查询失败，请稍后重试。");
    } finally {
      setLookingUp(false);
    }
  }, [minecraftUsername]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致。");
      return;
    }

    if (password.length < 6) {
      setError("密码长度至少需要 6 位。");
      return;
    }

    if (!mojangProfile) {
      setError("请先验证你的 Minecraft 正版账号。");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name: mojangProfile.name,
          minecraftUUID: mojangProfile.uuid,
          minecraftName: mojangProfile.name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "注册失败");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("注册成功，但自动登录失败，请手动前往登录页。");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("注册失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[#2D932D] shadow-[4px_4px_0px_0px_#1a5a1a]">
            <UserPlus className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-mono text-3xl font-bold text-slate-900">注册</h1>
          <p className="mt-2 text-slate-600">绑定正版账号，创建你的社区身份。</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="请输入邮箱"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#2D932D]"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-700">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="至少 6 位密码"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#2D932D]"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-slate-700">
                确认密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="再次输入密码"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#2D932D]"
              />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <h3 className="mb-1 text-sm font-bold text-blue-800">绑定 Minecraft 正版账号</h3>
                <p className="text-xs text-blue-700">
                  输入你的 Minecraft 用户名，系统会查询并展示对应头像。
                </p>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={minecraftUsername}
                    onChange={(event) => {
                      setMinecraftUsername(event.target.value);
                      setMojangProfile(null);
                      setLookupError("");
                    }}
                    placeholder="输入 Minecraft 用户名"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#2D932D]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={lookingUp || !minecraftUsername.trim()}
                  className="inline-flex items-center gap-2 rounded-md bg-[#0078D4] px-4 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_#005A9E] transition-all hover:bg-[#106EBE] disabled:opacity-50 disabled:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
                  <XCircle className="h-4 w-4 shrink-0" />
                  {lookupError}
                </div>
              )}

              {mojangProfile && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
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
                      <p className="mt-1 text-sm text-green-700">
                        Minecraft 用户名：<span className="font-bold">{mojangProfile.name}</span>
                      </p>
                      <p className="font-mono text-xs text-green-600">UUID: {mojangProfile.uuid}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !mojangProfile}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2D932D] px-6 py-3 text-base font-bold text-white shadow-[4px_4px_0px_0px_#1a5a1a] transition-all hover:bg-[#257a25] disabled:opacity-50 disabled:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
              已有账号？{" "}
              <Link
                href="/login"
                className="font-bold text-[#2D932D] transition-colors hover:text-[#257a25]"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
