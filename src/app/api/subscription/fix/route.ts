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

    // If user has a stripeCustomerId, check their subscription status
    if (user.stripeCustomerId && stripe) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];

        // Update user's subscription status
        await db.user.update({
          where: { id: userId },
          data: {
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            subscriptionPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
          },
        });

        return NextResponse.json({
          success: true,
          message: "Subscription status updated",
          subscription: {
            id: subscription.id,
            status: subscription.status,
            periodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: "No active subscription found",
    });
  } catch (error: any) {
    console.error("Error fixing subscription:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
