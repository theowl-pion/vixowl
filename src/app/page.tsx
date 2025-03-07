"use client";

// src/app/page.tsx
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";

// Features
const features = [
  {
    id: 1,
    title: "Text Behind Images",
    description:
      "Position text behind images with pixel-perfect precision and control",
    icon: (
      <svg
        className="w-10 h-10 text-[#CDFF63] mb-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 10C10.1 10 11 9.1 11 8C11 6.9 10.1 6 9 6C7.9 6 7 6.9 7 8C7 9.1 7.9 10 9 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.67 18.95L7.6 15.64C8.39 15.11 9.53 15.17 10.24 15.78L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Precise Text Positioning",
    description:
      "Control text placement, rotation, and perspective with intuitive tools",
    icon: (
      <svg
        className="w-10 h-10 text-[#CDFF63] mb-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 12.5H22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 20.5H19"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 3.5H19"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 16.5H21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 7.5H21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 4,
    title: "3D Perspective Control",
    description:
      "Adjust tilt, rotation, and perspective for dynamic visual effects",
    icon: (
      <svg
        className="w-10 h-10 text-[#CDFF63] mb-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.99998 3H8.99998C7.04998 8.84 7.04998 15.16 8.99998 21H7.99998"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 3C16.95 8.84 16.95 15.16 15 21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 16V15C8.84 16.95 15.16 16.95 21 15V16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 9.0001C8.84 7.0501 15.16 7.0501 21 9.0001"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 5,
    title: "Cloud Storage",
    description: "Securely store and access your projects from anywhere",
    icon: (
      <svg
        className="w-10 h-10 text-[#CDFF63] mb-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.5 19H17.5C21.5 19 22 17.2 22 15.5C22 13.8 21.5 12 17.5 12H16.5C16.5 9.65 16.71 8.94 14.5 8.94C13.24 8.94 12.5 10.15 12.5 11.9V12H6.5C2.5 12 2 13.8 2 15.5C2 17.2 2.5 19 6.5 19Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12V11.9C12 10.15 12.74 8.94 14 8.94C16.21 8.94 16 9.65 16 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 6,
    title: "Download Designs",
    description: "Export your creations in high quality for use in any project",
    icon: (
      <svg
        className="w-10 h-10 text-[#CDFF63] mb-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 11V17L11 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 17L7 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 10H18C15 10 14 9 14 6V2L22 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 7,
    title: "Intuitive Interface",
    description: "Clean, modern design that makes editing a joy, not a chore",
    icon: (
      <svg
        className="w-10 h-10 text-[#CDFF63] mb-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.49 2.23L5.50003 4.11C4.35003 4.54 3.41003 5.9 3.41003 7.12V14.55C3.41003 15.73 4.19003 17.28 5.14003 17.99L9.44003 21.2C10.85 22.26 13.17 22.26 14.58 21.2L18.88 17.99C19.83 17.28 20.61 15.73 20.61 14.55V7.12C20.61 5.89 19.67 4.53 18.52 4.1L13.53 2.23C12.68 1.92 11.32 1.92 10.49 2.23Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 15.5C14.2091 15.5 16 13.7091 16 11.5C16 9.29086 14.2091 7.5 12 7.5C9.79086 7.5 8 9.29086 8 11.5C8 13.7091 9.79086 15.5 12 15.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to home page
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo />

            <div className="flex items-center space-x-4">
              <Link
                href="/gallery"
                className="text-white/80 hover:text-[#CDFF63] px-3 py-1.5 rounded-lg hover:bg-white/5 text-sm"
              >
                Gallery
              </Link>
              <Link
                href="/pricing"
                className="text-white/80 hover:text-[#CDFF63] px-3 py-1.5 rounded-lg hover:bg-white/5 text-sm"
              >
                Pricing
              </Link>
              {user ? (
                <Link
                  href="/home"
                  className="bg-[#CDFF63] hover:bg-[#CDFF63]/90 text-black px-3 py-1.5 rounded-lg text-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/sign-in"
                    className="text-white/80 hover:text-[#CDFF63] px-3 py-1.5 rounded-lg hover:bg-white/5 text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="bg-[#CDFF63] hover:bg-[#CDFF63]/90 text-black px-3 py-1.5 rounded-lg text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-[#CDFF63] bg-clip-text text-transparent">
            Text Positioning Behind Images
            <br />
            Made Easy
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-3xl mx-auto">
            Create stunning designs with precise text positioning behind images.
            Control rotation, perspective, and tilt with our intuitive editor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="bg-[#CDFF63] hover:bg-[#CDFF63]/90 text-black px-6 py-3 rounded-lg font-medium text-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/gallery"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium text-lg"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          Powerful Features for Creative Control
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-[#CDFF63]/50 transition-all hover:bg-white/10"
            >
              {feature.icon}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] rounded-2xl p-8 md:p-12 border border-white/10">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Create Amazing Designs?
            </h2>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              Join thousands of designers and creators who use Vixowl to create
              stunning visuals with perfectly positioned text.
            </p>
            <Link
              href="/sign-up"
              className="bg-[#CDFF63] hover:bg-[#CDFF63]/90 text-black px-6 py-3 rounded-lg font-medium text-lg inline-block"
            >
              Start Creating Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">Vixowl</span>
              </Link>
              <p className="text-white/50 mt-2">
                © {new Date().getFullYear()} Vixowl. All rights reserved.
              </p>
            </div>
            <div className="flex gap-8">
              <Link
                href="/pricing"
                className="text-white/70 hover:text-[#CDFF63]"
              >
                Pricing
              </Link>
              <Link
                href="/gallery"
                className="text-white/70 hover:text-[#CDFF63]"
              >
                Gallery
              </Link>
              <Link
                href="/sign-in"
                className="text-white/70 hover:text-[#CDFF63]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
