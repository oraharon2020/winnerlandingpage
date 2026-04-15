"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
    });
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0e17]/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="text-xl font-bold text-white">
              הטיפ <span className="text-[#f5a623]">המנצח</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
            <a href="#how" className="hover:text-[#f5a623] transition">
              איך זה עובד
            </a>
            <a href="#pricing" className="hover:text-[#f5a623] transition">
              מסלולים
            </a>
            <a href="#faq" className="hover:text-[#f5a623] transition">
              שאלות נפוצות
            </a>
          </div>

          <div className="flex items-center gap-3">
            {loggedIn ? (
              <a
                href="/dashboard"
                className="bg-[#f5a623] hover:bg-[#d4891a] text-[#0a0e17] font-bold px-5 py-2 rounded-lg text-sm transition-all"
              >
                האזור האישי →
              </a>
            ) : (
              <>
                <a
                  href="/auth/login"
                  className="text-gray-300 hover:text-white text-sm transition-all"
                >
                  התחברות
                </a>
                <a
                  href="/checkout"
                  className="bg-[#f5a623] hover:bg-[#d4891a] text-[#0a0e17] font-bold px-5 py-2 rounded-lg text-sm transition-all"
                >
                  התחל לנצח →
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
