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
    "STRIPE_PUBLISHABLE_KEY:",
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      ? "Set (length: " +
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.length +
          ")"
      : "Not set"
  );
  console.log("STRIPE_PRICE_ID:", process.env.STRIPE_PRICE_ID || "Not set");
  console.log(
    "STRIPE_SECRET_KEY:",
    process.env.STRIPE_SECRET_KEY
      ? "Set (length: " + process.env.STRIPE_SECRET_KEY.length + ")"
      : "Not set"
  );

  // Check if the keys look valid
  if (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_")
  ) {
    console.error(
      "WARNING: STRIPE_PUBLISHABLE_KEY does not start with 'pk_', it may be invalid"
    );
  }

  if (
    process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.startsWith("sk_")
  ) {
    console.error(
      "WARNING: STRIPE_SECRET_KEY does not start with 'sk_', it may be invalid"
    );
  }
}

// Only initialize Stripe on the server side
let stripeInstance = null;
try {
  if (isServer && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });
    console.log("Stripe initialized successfully");
  } else if (isServer) {
    console.error("Failed to initialize Stripe: STRIPE_SECRET_KEY is not set");
  }
} catch (error) {
  console.error("Error initializing Stripe:", error);
}

export const stripe = stripeInstance;

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
