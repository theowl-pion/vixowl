"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    currency: "€",
    description: "Perfect for trying out Vixowl",
    features: [
      "Access to all text positioning features",
      "Create up to 2 designs",
      "Basic storage",
      "Community support",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "5",
    currency: "€",
    description: "For serious creators and professionals",
    features: [
      "Access to all text positioning features",
      "Unlimited designs",
      "Priority support",
      "Cloud storage",
      "High-quality exports",
    ],
    popular: true,
  },
];

export default function PricingPage() {
  // Force enable scrolling
  useEffect(() => {
    // Enable scrolling
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    // Force layout recalculation
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 0);

    return () => {
      // Cleanup
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-auto">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo />

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-white/80 hover:text-[#CDFF63] px-3 py-1.5 rounded-lg hover:bg-white/5 text-sm"
              >
                Home
              </Link>
              <Link
                href="/gallery"
                className="text-white/80 hover:text-[#CDFF63] px-3 py-1.5 rounded-lg hover:bg-white/5 text-sm"
              >
                Gallery
              </Link>
              <Link
                href="/sign-in"
                className="bg-[#CDFF63] hover:bg-[#CDFF63]/90 text-black px-3 py-1.5 rounded-lg text-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="py-20 bg-gradient-to-b from-black via-gray-900/80 to-black relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#CDFF63]/10 rounded-full filter blur-[100px] opacity-30"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[120px] opacity-20"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Start with our free plan and upgrade when you're ready to create
            more text-behind-image designs.
          </p>
        </div>
      </header>

      {/* Pricing Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-[#CDFF63]/10 border-2 border-[#CDFF63]"
                    : "bg-white/5 border border-white/10"
                } transition-transform hover:translate-y-[-5px] duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#CDFF63] text-black px-4 py-1 rounded-full text-sm font-medium">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl font-bold">
                      {plan.currency || "€"}
                    </span>
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-white/60 ml-2">/month</span>
                  </div>
                  <p className="text-white/60">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <svg
                        className="w-5 h-5 text-[#CDFF63] mr-3 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-center text-white/60 text-sm mt-6">
                  {plan.name === "Free"
                    ? "Start automatically with the free plan"
                    : "Upgrade when you reach the design limit"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <h3 className="text-xl font-semibold mb-3">
                How do I upgrade to Pro?
              </h3>
              <p className="text-white/60">
                When you reach the limit of 2 designs on the free plan, you'll
                be prompted to upgrade to the Pro plan to continue creating
                text-behind-image designs.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <h3 className="text-xl font-semibold mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-white/60">
                We accept all major credit cards and PayPal for the Pro plan
                subscription.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <h3 className="text-xl font-semibold mb-3">
                Can I cancel my subscription?
              </h3>
              <p className="text-white/60">
                Yes, you can cancel your Pro subscription at any time. You'll
                continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <h3 className="text-xl font-semibold mb-3">
                What happens to my designs if I downgrade?
              </h3>
              <p className="text-white/60">
                If you downgrade to the free plan, you'll still have access to
                your first 2 text-behind-image designs, but won't be able to
                create new ones until you upgrade again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2 text-[#CDFF63]">Vixowl</h3>
              <p className="text-white/60 max-w-md">
                The ultimate platform for positioning text behind images with
                precision and style.
              </p>
            </div>
            <div className="flex gap-8">
              <Link
                href="/gallery"
                className="text-white/70 hover:text-white transition-colors text-lg"
              >
                Gallery
              </Link>
              <Link
                href="/pricing"
                className="text-white/70 hover:text-white transition-colors text-lg"
              >
                Pricing
              </Link>
            </div>
          </div>
          <div className="mt-12 text-center text-white/40 text-sm">
            © {new Date().getFullYear()} Vixowl. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
