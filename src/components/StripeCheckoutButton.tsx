import React from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe";

interface StripeCheckoutButtonProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function StripeCheckoutButton({
  children,
  className = "",
  id,
}: StripeCheckoutButtonProps) {
  const { user } = useUser();

  const handleCheckout = async () => {
    try {
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      // Make sure we have a publishable key
      if (!STRIPE_PUBLISHABLE_KEY) {
        console.error("Stripe publishable key is not configured");
        return;
      }

      // Create a checkout session via our API
      const response = await axios.post("/api/stripe/checkout", {
        email: user.emailAddresses[0].emailAddress,
      });

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <button
      id={id}
      onClick={handleCheckout}
      className={className}
      disabled={!STRIPE_PUBLISHABLE_KEY}
    >
      {children}
    </button>
  );
}
