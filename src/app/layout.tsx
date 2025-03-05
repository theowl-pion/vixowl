// src/app/layout.tsx
import "../app/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
//import "./global.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Metadata } from "next";

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
    locale: "en_US",
    type: "website",
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
    <ClerkProvider
      appearance={{
        layout: {
          socialButtonsVariant: "iconButton",
        },
        variables: {
          colorPrimary: "#CDFF63",
        },
      }}
    >
      <html lang="en" className="overflow-auto">
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="icon" href="/assets/vixowl.png" type="image/png" />
          <link rel="apple-touch-icon" href="/assets/vixowl.png" />
        </head>
        <body className={`${inter.className} overflow-auto`}>
          {children}
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
