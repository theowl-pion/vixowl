import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

// Helper function to authenticate the user
async function authenticateUser(req: NextRequest) {
  // Get the authorization header
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, userId: null };
  }

  // Extract the token
  const token = authHeader.split(" ")[1];

  // Verify the token
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { authenticated: false, userId: null };
  }

  return { authenticated: true, userId: data.user.id, user: data.user };
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const { authenticated, userId } = await authenticateUser(req);

    if (!authenticated || !userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.subscriptionId) {
      return new NextResponse("No active subscription found", { status: 400 });
    }

    // Cancel the subscription at period end
    if (!stripe) {
      return new NextResponse("Stripe is not initialized", { status: 500 });
    }

    await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "canceled",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
