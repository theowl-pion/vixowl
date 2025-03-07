import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    // Check if Stripe is initialized
    if (!stripe) {
      return NextResponse.json(
        {
          error: "Stripe is not initialized",
          env: {
            hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
            secretKeyLength: process.env.STRIPE_SECRET_KEY
              ? process.env.STRIPE_SECRET_KEY.length
              : 0,
            hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
            publishableKeyLength: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
              ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.length
              : 0,
            hasPriceId: !!process.env.STRIPE_PRICE_ID,
            appUrl: process.env.NEXT_PUBLIC_APP_URL || "not set",
          },
        },
        { status: 500 }
      );
    }

    // Test Stripe connection by listing products
    const products = await stripe.products.list({ limit: 1 });

    return NextResponse.json({
      initialized: true,
      products: products.data.length,
      env: {
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        secretKeyPrefix: process.env.STRIPE_SECRET_KEY
          ? process.env.STRIPE_SECRET_KEY.substring(0, 7)
          : "not set",
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
          ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 7)
          : "not set",
        hasPriceId: !!process.env.STRIPE_PRICE_ID,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "not set",
      },
    });
  } catch (error: any) {
    console.error("Error testing Stripe:", error);
    return NextResponse.json(
      {
        error: "Stripe test failed",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
