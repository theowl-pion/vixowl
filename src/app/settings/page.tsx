"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useSubscription } from "@/hooks/useSubscription";
import { formatAmountForDisplay } from "@/lib/stripe";
import { FREE_PLAN_IMAGE_LIMIT } from "@/lib/stripe";
import UsageDisplay from "@/components/UsageDisplay";
import SubscriptionDashboard from "@/components/SubscriptionDashboard";
// import BugReportModal from "@/components/BugReportModal";
// import FeatureRequestModal from "@/components/FeatureRequestModal";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const { user, session, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // const [showBugReportModal, setShowBugReportModal] = useState(false);
  // const [showFeatureRequestModal, setShowFeatureRequestModal] = useState(false);

  useEffect(() => {
    if (authLoading === false) {
      setIsLoading(false);
      if (user?.user_metadata?.full_name) {
        setName(user.user_metadata.full_name);
      }
    }
  }, [authLoading, user]);

  if (!isLoading && !user) {
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

  const handleSaveName = async () => {
    if (!session?.access_token) return;

    setIsSaving(true);
    try {
      // Update user metadata in Supabase
      const response = await axios.post(
        "/api/user/update-profile",
        { full_name: name },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      toast.success("Name updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
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
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-[#2A2A2A] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#CDFF63]"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSaving}
                      className="bg-[#CDFF63] text-black px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#CDFF63]/90 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setName(user?.user_metadata?.full_name || "");
                      }}
                      className="text-white/80 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {user?.user_metadata?.full_name || "User"}
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[#CDFF63] hover:text-[#CDFF63]/90 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-white/60 mb-1">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-white/60 mb-1">Member Since</span>
                <span className="font-medium">
                  {user?.created_at
                    ? formatDate(new Date(user.created_at))
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Comment out the Help & Feedback section
          <div className="bg-[#1A1A1A] rounded-xl p-8 mt-8 border border-white/10">
            <h2 className="text-2xl font-semibold mb-6 text-[#CDFF63]">
              Help & Feedback
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setShowBugReportModal(true)}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>Report a Bug</span>
              </button>

              <button
                onClick={() => setShowFeatureRequestModal(true)}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-[#CDFF63]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span>Request a Feature</span>
              </button>
            </div>
          </div>
          */}
        </div>
      </div>

      {/* Comment out the modals
      <BugReportModal
        isOpen={showBugReportModal}
        onClose={() => setShowBugReportModal(false)}
      />

      <FeatureRequestModal
        isOpen={showFeatureRequestModal}
        onClose={() => setShowFeatureRequestModal(false)}
      />
      */}
    </div>
  );
}
