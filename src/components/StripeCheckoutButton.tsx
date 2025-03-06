import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "react-hot-toast";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      if (!user) {
        toast.error("Please sign in to upgrade");
        console.error("User not authenticated");
        return;
      }

      // Create a checkout session via our API
      const response = await axios.post("/api/stripe/checkout", {
        email: user.emailAddresses[0].emailAddress,
      });

      // Log the response for debugging
      console.log("Checkout session created:", response.data);

      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error("Failed to create checkout session");
        console.error("No URL returned from checkout API");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start checkout process. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      id={id}
      onClick={handleCheckout}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
