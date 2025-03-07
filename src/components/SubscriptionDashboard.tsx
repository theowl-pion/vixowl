import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";
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
  const { session } = useAuth();

  const handleManageSubscription = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to manage your subscription");
      return;
    }

    try {
      toast.loading("Accessing billing portal...");
      const response = await axios.post(
        "/api/stripe/portal",
        {},
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      toast.dismiss();
      console.log("Portal response:", response.data);

      if (response.data.url) {
        // Validate URL before redirecting
        try {
          new URL(response.data.url);
          window.location.href = response.data.url;
        } catch (e) {
          console.error("Invalid URL received:", response.data.url);
          toast.error("Received invalid portal URL");
        }
      } else {
        toast.error("No portal URL received from server");
      }
    } catch (error: any) {
      toast.dismiss();
      console.error("Error accessing billing portal:", error);

      // Display more specific error message
      if (error.response) {
        const errorData = error.response.data;
        toast.error(
          errorData.message ||
            errorData.error ||
            "Failed to access billing portal"
        );
      } else {
        toast.error("Failed to access billing portal");
      }
    }
  };

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
        Subscription Status
      </h2>

      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="text-white/60 mb-1">Current Plan</span>
          <span className="font-medium">
            {isSubscribed ? "Pro Plan" : "Free Plan"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-white/60 mb-1">Status</span>
          <span className="font-medium capitalize">
            {subscriptionStatus || "Free"}
          </span>
        </div>

        {isSubscribed && (
          <div className="flex flex-col">
            <span className="text-white/60 mb-1">Next Billing Date</span>
            <span className="font-medium">
              {formatDate(subscriptionPeriodEnd)}
            </span>
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={handleManageSubscription}
            className="bg-[#CDFF63] text-black px-4 py-2 rounded-lg hover:bg-[#CDFF63]/90 transition-colors font-medium"
          >
            {isSubscribed ? "Manage Subscription" : "Upgrade to Pro"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
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
