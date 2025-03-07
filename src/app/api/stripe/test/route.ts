import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    // Log environment variables
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

    // Check if Stripe is initialized
    if (!stripe) {
      console.error(
        "Stripe is not initialized. Check STRIPE_SECRET_KEY environment variable."
      );
      return NextResponse.json(
        { error: "Stripe is not initialized" },
        { status: 500 }
      );
    }

    // Try to list products to test the Stripe connection
    try {
      const products = await stripe.products.list({ limit: 1 });
      return NextResponse.json({
        success: true,
        message: "Stripe is working correctly",
        productsCount: products.data.length,
        stripeInitialized: !!stripe,
      });
    } catch (error: any) {
      console.error("Error testing Stripe connection:", error);
      return NextResponse.json(
        {
          error: "Error testing Stripe connection",
          message: error.message,
          stripeInitialized: !!stripe,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Unhandled error in test API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
