import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({
  className = "",
  size = "md",
  showText = true,
}: LogoProps) {
  // Define size dimensions
  const sizes = {
    sm: { width: 6, height: 6, text: "text-lg" },
    md: { width: 8, height: 8, text: "text-xl" },
    lg: { width: 10, height: 10, text: "text-2xl" },
  };

  const { width, height, text } = sizes[size];

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div
        className={`relative w-${width} h-${height}`}
        style={{ width: `${width * 0.25}rem`, height: `${height * 0.25}rem` }}
      >
        <Image
          src="/assets/vixowl.png"
          alt="Vixowl Logo"
          fill
          className="object-contain"
        />
      </div>
      {showText && (
        <span className={`${text} font-bold text-white`}>Vixowl</span>
      )}
    </Link>
  );
}
