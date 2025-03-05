"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useSubscription } from "@/hooks/useSubscription";
import { formatAmountForDisplay } from "@/lib/stripe";
import { FREE_PLAN_IMAGE_LIMIT } from "@/lib/stripe";
import UsageDisplay from "@/components/UsageDisplay";
import SubscriptionDashboard from "@/components/SubscriptionDashboard";

export default function SettingsPage() {
  const { isSignedIn, user } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn !== undefined) {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  if (!isLoading && !isSignedIn) {
    redirect("/");
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="flex h-screen bg-[#121212] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

            <SubscriptionDashboard />

            <div className="bg-[#1A1A1A] rounded-xl p-8 mt-8 border border-white/10">
              <h2 className="text-2xl font-semibold mb-6 text-[#CDFF63]">
                Account Information
              </h2>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-white/60 mb-1">Name</span>
                  <span className="font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-white/60 mb-1">Email</span>
                  <span className="font-medium">
                    {user?.emailAddresses[0].emailAddress}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-white/60 mb-1">Member Since</span>
                  <span className="font-medium">
                    {user?.createdAt
                      ? formatDate(new Date(user.createdAt))
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
