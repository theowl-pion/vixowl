import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = data.user.id;

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.subscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    // Check if Stripe is initialized
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not initialized" },
        { status: 500 }
      );
    }

    try {
      // Retrieve the subscription to verify it exists
      const subscription = await stripe.subscriptions.retrieve(
        user.subscriptionId
      );

      // Cancel the subscription at period end
      await stripe.subscriptions.update(user.subscriptionId, {
        cancel_at_period_end: true,
      });

      // Update user in database
      await db.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: "canceled",
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "Subscription will be canceled at the end of the billing period",
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
    } catch (stripeError: any) {
      console.error("[STRIPE_SUBSCRIPTION_ERROR]", stripeError);

      // If the subscription doesn't exist in Stripe, update our database
      if (stripeError.code === "resource_missing") {
        await db.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: "canceled",
            subscriptionId: null,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Subscription record has been cleared",
        });
      }

      return NextResponse.json(
        { error: `Stripe error: ${stripeError.message}` },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[SUBSCRIPTION_CANCEL_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
