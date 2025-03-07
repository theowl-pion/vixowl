import React from "react";
import SignInForm from "@/components/SignInForm";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black">
      <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Logo />
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <SignInForm />
      </main>

      <footer className="py-6 px-4 sm:px-6 lg:px-8 text-center text-white/40 text-sm">
        <p>© {new Date().getFullYear()} Vixowl. All rights reserved.</p>
      </footer>
    </div>
  );
}
