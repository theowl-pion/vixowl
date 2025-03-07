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
    console.log("User ID:", userId);

    // Get user from database
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      console.log("User from DB:", user ? JSON.stringify(user) : "Not found");

      if (!user) {
        return NextResponse.json(
          { error: "User not found in database" },
          { status: 404 }
        );
      }

      if (!user.stripeCustomerId) {
        return NextResponse.json(
          { error: "No Stripe customer ID found" },
          { status: 404 }
        );
      }

      if (!stripe) {
        console.error("Stripe is not initialized");
        return NextResponse.json(
          { error: "Stripe is not initialized" },
          { status: 500 }
        );
      }

      // Create a billing portal session
      try {
        const session = await stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId,
          return_url: `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/settings`,
        });

        return NextResponse.json({ url: session.url });
      } catch (stripeError: any) {
        console.error("Stripe error:", stripeError);
        return NextResponse.json(
          {
            error: "Stripe error",
            message: stripeError.message,
            code: stripeError.code,
          },
          { status: 500 }
        );
      }
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error", message: dbError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
