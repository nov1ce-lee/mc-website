"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      router.push("/login");
    } catch (error) {
      console.error("Navigation failed:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#2D932D] hover:bg-[#257a25] transition-all rounded-md shadow-[4px_4px_0px_0px_#1a5a1a] disabled:opacity-50 disabled:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      登录
    </button>
  );
}
