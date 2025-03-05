// src/components/Header.tsx
"use client";

import React from "react";
import {
  useUser,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { isSignedIn } = useUser();

  return (
    <header className="py-6 flex justify-between items-center mb-6 w-full">
      <h1 className="text-2xl text-white/90 font-light">Your Workplace</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5">
          <svg
            className="w-4 h-4 text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search something..."
            className="bg-transparent text-white/90 w-64 focus:outline-none text-sm"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        <button className="bg-[#CDFF63] text-black px-5 py-1.5 rounded-full text-sm font-medium hover:bg-[#CDFF63]/90 transition-colors flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Upgrade
        </button>
      </div>
    </header>
  );
}
