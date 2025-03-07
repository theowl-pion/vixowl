import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
  const { user, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      if (!user) {
        toast.error("Please sign in to upgrade");
        console.error("User not authenticated");
        return;
      }

      console.log("Starting checkout process for user:", user.id);
      console.log("User email:", user.email);

      // Create a checkout session via our API
      const response = await axios
        .post(
          "/api/stripe/checkout",
          {
            email: user.email,
          },
          {
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          }
        )
        .catch((error) => {
          console.error("Axios error details:", {
            message: error.message,
            response: error.response
              ? {
                  status: error.response.status,
                  data: error.response.data,
                }
              : "No response",
            request: error.request
              ? "Request was made but no response received"
              : "No request",
          });
          throw error; // Re-throw to be caught by the outer catch
        });

      // Log the response for debugging
      console.log("Checkout session created:", response.data);

      // Redirect to Stripe Checkout
      if (response.data && response.data.url) {
        console.log("Redirecting to:", response.data.url);
        window.location.href = response.data.url;
      } else {
        console.error("No URL returned from checkout API:", response.data);
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
        console.error("Status:", error.response?.status);
        console.error("Response data:", error.response?.data);
      } else {
        console.error("Error creating checkout session:", error);
      }
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
