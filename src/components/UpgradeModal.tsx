import React from "react";
import { FREE_PLAN_IMAGE_LIMIT } from "@/lib/stripe";
import StripeCheckoutButton from "./StripeCheckoutButton";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  percentage: number;
  isSubscribed: boolean;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  percentage,
  isSubscribed,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#CDFF63]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-[#CDFF63]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            Upgrade Your Plan
          </h3>
          <p className="text-white/70 mb-4">
            You've reached the limit of {FREE_PLAN_IMAGE_LIMIT} images on the
            free plan. Upgrade to unlock unlimited images and premium features.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-black/30 rounded-lg p-4 border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 font-medium">Pro Plan</span>
              <span className="text-[#CDFF63] font-medium">5€/month</span>
            </div>
            <ul className="text-sm text-white/70 space-y-2 mb-4">
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-[#CDFF63] mr-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Unlimited image uploads
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-[#CDFF63] mr-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Priority background removal
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-[#CDFF63] mr-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Advanced text effects
              </li>
            </ul>
          </div>

          <StripeCheckoutButton className="w-full bg-[#CDFF63] text-black font-medium py-3 rounded-lg hover:bg-[#CDFF63]/90 transition-colors">
            Upgrade Now
          </StripeCheckoutButton>

          <button
            onClick={onClose}
            className="w-full bg-transparent border border-white/20 text-white/80 font-medium py-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {percentage >= 100 && !isSubscribed && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">
              <span className="font-medium">Oops! 🙈</span> You've maxed out
              your free plan! Deleting images won't free up your quota. Time to
              level up! ✨ Upgrade for unlimited creative powers! 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
