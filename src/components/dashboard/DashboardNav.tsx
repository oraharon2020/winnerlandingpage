"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function DashboardNav({ user }: { user: User }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="border-b border-white/10 bg-[#111827]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-white">
          🏆 הטיפ המנצח
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-gray-300 hover:text-white text-sm transition-colors"
          >
            טיפים
          </Link>
          <Link
            href="/dashboard/results"
            className="text-gray-300 hover:text-white text-sm transition-colors"
          >
            תוצאות
          </Link>

          <div className="flex items-center gap-3 mr-4 border-r border-white/10 pr-4">
            <span className="text-gray-400 text-sm">
              {user.email?.split("@")[0]}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 text-sm transition-colors"
            >
              יציאה
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
