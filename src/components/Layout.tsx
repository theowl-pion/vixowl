"use client";

// src/components/Layout.tsx
import React from "react";
import Header from "./Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Header />
      <main className="text-white">{children}</main>
    </div>
  );
};

export default Layout;
