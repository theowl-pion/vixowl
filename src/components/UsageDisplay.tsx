import React from "react";
import { FREE_PLAN_IMAGE_LIMIT } from "@/lib/stripe";
import StripeCheckoutButton from "./StripeCheckoutButton";
import { toast } from "react-hot-toast";

interface UsageDisplayProps {
  isSubscribed: boolean;
  imagesUploaded: number;
  onUpgradeClick?: () => void;
}

export default function UsageDisplay({
  isSubscribed,
  imagesUploaded,
  onUpgradeClick,
}: UsageDisplayProps) {
  // Calculate percentage for the progress bar
  const percentage = Math.min(
    (imagesUploaded / FREE_PLAN_IMAGE_LIMIT) * 100,
    100
  );

  // Calculate remaining images
  const remainingImages = isSubscribed
    ? Infinity
    : Math.max(0, FREE_PLAN_IMAGE_LIMIT - imagesUploaded);

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      // This will be handled by the StripeCheckoutButton component
      console.log("Direct upgrade button clicked");
    }
  };

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Usage</h3>
        {!isSubscribed && onUpgradeClick && (
          <button
            onClick={handleUpgradeClick}
            className="text-[#CDFF63] text-sm font-medium hover:underline"
          >
            Upgrade
          </button>
        )}
        {!isSubscribed && !onUpgradeClick && (
          <StripeCheckoutButton
            id="usage-upgrade-button"
            className="text-[#CDFF63] text-sm font-medium hover:underline"
          >
            Upgrade
          </StripeCheckoutButton>
        )}
      </div>

      {isSubscribed ? (
        <div className="flex flex-col items-center py-4">
          <div className="w-16 h-16 rounded-full bg-[#CDFF63]/10 flex items-center justify-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-[#CDFF63]"
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
          </div>
          <p className="text-center text-white/80 text-sm">
            You have unlimited image uploads with your Premium subscription.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">Images Used</span>
            <span className="text-white font-medium">
              {imagesUploaded} / {FREE_PLAN_IMAGE_LIMIT}
            </span>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full ${
                percentage >= 100 ? "bg-red-500" : "bg-[#CDFF63]"
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">
              {remainingImages === 0
                ? "No images remaining"
                : `${remainingImages} image${
                    remainingImages !== 1 ? "s" : ""
                  } remaining`}
            </span>
            {percentage >= 100 && (
              <span className="text-red-400">Limit reached</span>
            )}
          </div>

          {percentage >= 100 && !isSubscribed && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">
                <span className="font-medium">Oops! 🙈</span> You've maxed out
                your free plan! Deleting images won't free up your quota. Time
                to level up! ✨ Upgrade for unlimited creative powers! 🚀
              </p>
              <div className="mt-3">
                <StripeCheckoutButton
                  id="limit-reached-upgrade-button"
                  className="w-full bg-[#CDFF63] text-black font-medium py-2 rounded-lg hover:bg-[#CDFF63]/90 transition-colors"
                >
                  Upgrade Now
                </StripeCheckoutButton>
              </div>
            </div>
          )}

          {percentage >= 75 && percentage < 100 && !isSubscribed && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                <span className="font-medium">Almost there! ⚠️</span> You're
                about to reach your limit! Once you hit the max, you'll need to
                upgrade to keep creating. Why wait? Upgrade now and unleash your
                creativity! 🎨
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
