import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { FREE_PLAN_IMAGE_LIMIT } from "@/lib/stripe";
import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
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

    // Get user's subscription from the database
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        subscriptionId: true,
        subscriptionStatus: true,
        subscriptionPeriodEnd: true,
        stripeCustomerId: true,
        imagesUploaded: true,
      },
    });

    // Check if user is subscribed
    const isSubscribed =
      user &&
      user.subscriptionId &&
      user.subscriptionStatus === "active" &&
      user.subscriptionPeriodEnd &&
      user.subscriptionPeriodEnd.getTime() > Date.now();

    // Calculate remaining images based on total uploads, not current count
    // This ensures users can't delete images to upload more
    const imagesUploaded = user?.imagesUploaded || 0;
    const remainingImages = isSubscribed
      ? Infinity
      : Math.max(0, FREE_PLAN_IMAGE_LIMIT - imagesUploaded);

    return NextResponse.json({
      isSubscribed,
      subscription: {
        id: user?.subscriptionId || null,
        status: user?.subscriptionStatus || null,
        periodEnd: user?.subscriptionPeriodEnd || null,
        customerId: user?.stripeCustomerId || null,
      },
      imagesUploaded: imagesUploaded,
      remainingImages,
      limit: FREE_PLAN_IMAGE_LIMIT,
    });
  } catch (error) {
    console.error("[SUBSCRIPTION_STATUS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
