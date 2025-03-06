import Stripe from "stripe";

// Constants that are safe to use on both client and server
export const FREE_PLAN_IMAGE_LIMIT = 2;
export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";

// Helper to check if code is running on server
const isServer = typeof window === "undefined";

// Log environment variables for debugging (only on server)
if (isServer) {
  console.log(
    "STRIPE_PUBLISHABLE_KEY set:",
    !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
  console.log("STRIPE_PRICE_ID set:", !!process.env.STRIPE_PRICE_ID);
  console.log("STRIPE_SECRET_KEY set:", !!process.env.STRIPE_SECRET_KEY);
}

// Only initialize Stripe on the server side
export const stripe = isServer
  ? new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-02-24.acacia",
    })
  : null;

export const formatAmountForDisplay = (
  amount: number,
  currency: string
): string => {
  const numberFormat = new Intl.NumberFormat(["en-US"], {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
  });
  return numberFormat.format(amount);
};

export const formatAmountForStripe = (
  amount: number,
  currency: string
): number => {
  const currencies = ["USD", "EUR", "GBP"];
  const multiplier = currencies.includes(currency.toUpperCase()) ? 100 : 1;
  return Math.round(amount * multiplier);
};
