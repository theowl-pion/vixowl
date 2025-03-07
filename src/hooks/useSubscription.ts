import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { FREE_PLAN_IMAGE_LIMIT } from "@/lib/stripe";

interface SubscriptionData {
  isLoading: boolean;
  isSubscribed: boolean;
  imagesUploaded: number;
  remainingImages: number;
  subscriptionStatus: string | null;
  subscriptionPeriodEnd: Date | null;
  cancelSubscription: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

export function useSubscription(): SubscriptionData {
  const { user, session, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<{
    isSubscribed: boolean;
    imagesUploaded: number;
    remainingImages: number;
    subscriptionStatus: string | null;
    subscriptionPeriodEnd: Date | null;
  }>({
    isSubscribed: false,
    imagesUploaded: 0,
    remainingImages: FREE_PLAN_IMAGE_LIMIT,
    subscriptionStatus: null,
    subscriptionPeriodEnd: null,
  });

  const fetchSubscription = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!user || !session?.access_token) {
      setIsLoading(false);
      setSubscriptionData({
        isSubscribed: false,
        imagesUploaded: 0,
        remainingImages: FREE_PLAN_IMAGE_LIMIT,
        subscriptionStatus: "free",
        subscriptionPeriodEnd: null,
      });
      return;
    }

    try {
      // Use the subscription status API endpoint with authorization header
      const response = await axios.get("/api/subscription/status", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = response.data;

      setSubscriptionData({
        isSubscribed: data.isSubscribed,
        imagesUploaded: data.imagesUploaded,
        remainingImages: data.remainingImages,
        subscriptionStatus: data.subscription?.status || null,
        subscriptionPeriodEnd: data.subscription?.periodEnd
          ? new Date(data.subscription.periodEnd)
          : null,
      });
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      // Set default values in case of error
      setSubscriptionData({
        isSubscribed: false,
        imagesUploaded: 0,
        remainingImages: FREE_PLAN_IMAGE_LIMIT,
        subscriptionStatus: "free",
        subscriptionPeriodEnd: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading, session?.access_token]);

  useEffect(() => {
    if (user && session?.access_token) {
      fetchSubscription();
    } else {
      // Set default values if not authenticated
      setSubscriptionData({
        isSubscribed: false,
        imagesUploaded: 0,
        remainingImages: FREE_PLAN_IMAGE_LIMIT,
        subscriptionStatus: "free",
        subscriptionPeriodEnd: null,
      });
      setIsLoading(false);
    }
  }, [fetchSubscription, user, session?.access_token]);

  const refreshUsage = useCallback(async () => {
    if (!session?.access_token) {
      console.log("No access token available, waiting for authentication...");
      // Wait a moment and try again if user is logged in but token isn't ready
      if (user) {
        setTimeout(() => fetchSubscription(), 1000);
      }
      return;
    }

    try {
      const response = await axios.get("/api/subscription/status", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = response.data;

      setSubscriptionData({
        isSubscribed: data.isSubscribed,
        imagesUploaded: data.imagesUploaded,
        remainingImages: data.remainingImages,
        subscriptionStatus: data.subscription?.status || null,
        subscriptionPeriodEnd: data.subscription?.periodEnd
          ? new Date(data.subscription.periodEnd)
          : null,
      });
    } catch (error) {
      console.error("Error refreshing usage data:", error);
    }
  }, [session?.access_token, user, fetchSubscription]);

  const cancelSubscription = async () => {
    if (!session?.access_token) {
      console.log("No access token available, cannot cancel subscription");
      return;
    }

    try {
      await axios.post(
        "/api/subscription/cancel",
        {},
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      // Refresh subscription data
      await fetchSubscription();
    } catch (error) {
      console.error("Error canceling subscription:", error);
    }
  };

  return {
    isLoading,
    isSubscribed: subscriptionData.isSubscribed,
    imagesUploaded: subscriptionData.imagesUploaded,
    remainingImages: subscriptionData.remainingImages,
    subscriptionStatus: subscriptionData.subscriptionStatus,
    subscriptionPeriodEnd: subscriptionData.subscriptionPeriodEnd,
    cancelSubscription,
    refreshUsage,
  };
}
