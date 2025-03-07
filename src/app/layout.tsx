// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vixowl | Text Positioning Behind Images Made Easy",
  description:
    "Vixowl is a powerful platform for positioning text behind images with precise control over rotation, perspective, and tilt. Create stunning visual designs with our intuitive editor.",
  keywords: [
    "text positioning",
    "image editing",
    "3D perspective",
    "text behind images",
    "visual design",
    "creative tools",
    "Vixowl",
  ],
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/assets/vixowl.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/assets/vixowl.png" },
      { url: "/assets/vixowl.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Vixowl | Text Positioning Behind Images Made Easy",
    description:
      "Create stunning designs with precise text positioning behind images. Control rotation, perspective, and tilt with our intuitive editor.",
    url: "https://vixowl.com",
    siteName: "Vixowl",
    images: [
      {
        url: "/assets/vixowl.png",
        width: 1200,
        height: 1200,
        alt: "Vixowl - Text Positioning Behind Images",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vixowl | Text Positioning Behind Images Made Easy",
    description:
      "Create stunning designs with precise text positioning behind images. Control rotation, perspective, and tilt with our intuitive editor.",
    images: ["/assets/vixowl.png"],
  },
  metadataBase: new URL("https://vixowl.com"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
