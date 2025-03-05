import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
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
  const { user, isLoaded } = useUser();
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
    if (!isLoaded || !user) {
      setIsLoading(false);
      return;
    }

    try {
      // Use the subscription status API endpoint
      const response = await axios.get("/api/subscription/status");
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
  }, [user, isLoaded]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const refreshUsage = useCallback(async () => {
    try {
      const response = await axios.get("/api/subscription/status");
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
  }, []);

  const cancelSubscription = async () => {
    try {
      await axios.post("/api/subscription/cancel");
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
