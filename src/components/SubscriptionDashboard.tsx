import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { formatAmountForDisplay } from "@/lib/stripe";
import UsageDisplay from "./UsageDisplay";
import StripeCheckoutButton from "./StripeCheckoutButton";

export default function SubscriptionDashboard() {
  const {
    isLoading,
    isSubscribed,
    imagesUploaded,
    subscriptionStatus,
    subscriptionPeriodEnd,
    cancelSubscription,
  } = useSubscription();

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="bg-[#1A1A1A] rounded-xl p-8 border border-white/10 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-6"></div>
        <div className="h-24 bg-white/5 rounded mb-4"></div>
        <div className="h-24 bg-white/5 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-8 border border-white/10">
      <h2 className="text-2xl font-semibold mb-6 text-[#CDFF63]">
        Subscription Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4 text-white/90">
            Current Plan
          </h3>
          <div className="bg-[#252525] rounded-lg p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/80">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isSubscribed
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {subscriptionStatus === "active"
                  ? "Active"
                  : subscriptionStatus === "canceled"
                  ? "Canceled"
                  : "Free"}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-white/80">Plan</span>
              <span className="font-medium text-white">
                {isSubscribed ? "Premium" : "Free"}
              </span>
            </div>

            {isSubscribed && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/80">Renewal Date</span>
                <span className="font-medium text-white">
                  {formatDate(subscriptionPeriodEnd)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <span className="text-white/80">Price</span>
              <span className="font-medium text-white">
                {isSubscribed
                  ? formatAmountForDisplay(5, "USD") + "/month"
                  : "Free"}
              </span>
            </div>

            <div className="mt-2">
              {isSubscribed ? (
                subscriptionStatus === "canceled" ? (
                  <StripeCheckoutButton className="w-full py-2 px-4 bg-[#CDFF63] text-black rounded-lg font-medium hover:bg-[#CDFF63]/90 transition">
                    Resubscribe
                  </StripeCheckoutButton>
                ) : (
                  <button
                    onClick={cancelSubscription}
                    className="w-full py-2 px-4 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-medium hover:bg-red-500/20 transition"
                  >
                    Cancel Subscription
                  </button>
                )
              ) : (
                <StripeCheckoutButton className="w-full py-2 px-4 bg-[#CDFF63] text-black rounded-lg font-medium hover:bg-[#CDFF63]/90 transition">
                  Upgrade to Premium
                </StripeCheckoutButton>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 text-white/90">Usage</h3>
          <UsageDisplay
            isSubscribed={isSubscribed}
            imagesUploaded={imagesUploaded}
            onUpgradeClick={() => {
              // This will be handled by the StripeCheckoutButton
              document.getElementById("upgrade-button")?.click();
            }}
          />
          {/* Hidden button for the UsageDisplay to trigger */}
          <StripeCheckoutButton id="upgrade-button" className="hidden">
            Upgrade
          </StripeCheckoutButton>
        </div>
      </div>
    </div>
  );
}
