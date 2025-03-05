import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
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
